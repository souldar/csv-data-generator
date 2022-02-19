
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\selector.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1$1, console: console_1 } = globals;
    const file$1 = "src\\selector.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (42:8) {#each creatorKeys as creatorKey}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*creatorMap*/ ctx[1][/*creatorKey*/ ctx[15]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*creatorKey*/ ctx[15];
    			option.value = option.__value;
    			add_location(option, file$1, 42, 12, 1290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*creatorMap*/ 2 && t_value !== (t_value = /*creatorMap*/ ctx[1][/*creatorKey*/ ctx[15]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(42:8) {#each creatorKeys as creatorKey}",
    		ctx
    	});

    	return block;
    }

    // (54:42) 
    function create_if_block_2(ctx) {
    	let input;
    	let t;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(/*data*/ ctx[0].extraData || {});
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(input, "placeholder", "输入可能的枚举");
    			attr_dev(input, "class", "svelte-1ww148w");
    			add_location(input, file$1, 54, 8, 1777);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "keyup", /*enumInput*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, data, delEnum*/ 65) {
    				each_value = Object.keys(/*data*/ ctx[0].extraData || {});
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(54:42) ",
    		ctx
    	});

    	return block;
    }

    // (52:43) 
    function create_if_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "placeholder", "输入不变的值");
    			attr_dev(input, "class", "svelte-1ww148w");
    			add_location(input, file$1, 52, 8, 1664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*extraDataChanged*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(52:43) ",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#if data.creatorKey === "randomString" || data.creatorKey === "randomNumber"}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "placeholder", "数据长度");
    			attr_dev(input, "class", "svelte-1ww148w");
    			add_location(input, file$1, 46, 8, 1476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*data*/ ctx[0].extraData);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*extraDataChanged*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, creatorKeys*/ 5 && input.value !== /*data*/ ctx[0].extraData) {
    				set_input_value(input, /*data*/ ctx[0].extraData);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(46:4) {#if data.creatorKey === \\\"randomString\\\" || data.creatorKey === \\\"randomNumber\\\"}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#each Object.keys(data.extraData || {}) as Enum}
    function create_each_block$1(ctx) {
    	let span2;
    	let span0;
    	let t0_value = /*Enum*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let span1_data_item_value;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span2 = element("span");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text("X");
    			t3 = space();
    			add_location(span0, file$1, 57, 16, 1938);
    			attr_dev(span1, "class", "close svelte-1ww148w");
    			attr_dev(span1, "data-item", span1_data_item_value = /*Enum*/ ctx[12]);
    			add_location(span1, file$1, 58, 16, 1976);
    			attr_dev(span2, "class", "tag svelte-1ww148w");
    			add_location(span2, file$1, 56, 12, 1902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span2, anchor);
    			append_dev(span2, span0);
    			append_dev(span0, t0);
    			append_dev(span2, t1);
    			append_dev(span2, span1);
    			append_dev(span1, t2);
    			append_dev(span2, t3);

    			if (!mounted) {
    				dispose = listen_dev(span1, "click", /*delEnum*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*Enum*/ ctx[12] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*data, creatorKeys*/ 5 && span1_data_item_value !== (span1_data_item_value = /*Enum*/ ctx[12])) {
    				attr_dev(span1, "data-item", span1_data_item_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(56:8) {#each Object.keys(data.extraData || {}) as Enum}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let select;
    	let option;
    	let t1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*creatorKeys*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].creatorKey === "randomString" || /*data*/ ctx[0].creatorKey === "randomNumber") return create_if_block;
    		if (/*data*/ ctx[0].creatorKey === "holdon") return create_if_block_1;
    		if (/*data*/ ctx[0].creatorKey === "enums") return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "选择数据类型";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (if_block) if_block.c();
    			option.selected = true;
    			option.disabled = true;
    			option.hidden = true;
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$1, 40, 8, 1174);
    			attr_dev(select, "class", "svelte-1ww148w");
    			if (/*data*/ ctx[0].creatorKey === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file$1, 39, 4, 1101);
    			attr_dev(div, "class", "selector svelte-1ww148w");
    			add_location(div, file$1, 38, 0, 1073);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*data*/ ctx[0].creatorKey);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*selectChanged*/ ctx[3], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*creatorKeys, creatorMap*/ 6) {
    				each_value_1 = /*creatorKeys*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*data, creatorKeys*/ 5) {
    				select_option(select, /*data*/ ctx[0].creatorKey);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Selector', slots, []);
    	let { selectorId } = $$props;
    	let { data } = $$props;
    	let { creatorMap } = $$props;
    	const creatorKeys = Object.keys(creatorMap);
    	const dispatch = createEventDispatcher();

    	function valueChanged(key, value) {
    		dispatch("valueChanged", { [key]: value, selectorId });
    	}

    	function selectChanged(event) {
    		valueChanged("creatorKey", event.target.value);
    	}

    	function extraDataChanged(event) {
    		valueChanged("extraData", event.target.value);
    	}

    	function enumInput(event) {
    		console.log(event);

    		if (event.keyCode === 13) {
    			valueChanged("extraData", {
    				...data.extraData,
    				[event.target.value]: 1
    			});

    			event.target.value = "";
    		}
    	}

    	function delEnum(event) {
    		const temp = { ...data.extraData };
    		delete temp[event.target.dataset.item];
    		valueChanged("extraData", temp);
    	}

    	const writable_props = ['selectorId', 'data', 'creatorMap'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Selector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		data.creatorKey = select_value(this);
    		$$invalidate(0, data);
    		$$invalidate(2, creatorKeys);
    	}

    	function input_input_handler() {
    		data.extraData = this.value;
    		$$invalidate(0, data);
    		$$invalidate(2, creatorKeys);
    	}

    	$$self.$$set = $$props => {
    		if ('selectorId' in $$props) $$invalidate(7, selectorId = $$props.selectorId);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('creatorMap' in $$props) $$invalidate(1, creatorMap = $$props.creatorMap);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		selectorId,
    		data,
    		creatorMap,
    		creatorKeys,
    		dispatch,
    		valueChanged,
    		selectChanged,
    		extraDataChanged,
    		enumInput,
    		delEnum
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectorId' in $$props) $$invalidate(7, selectorId = $$props.selectorId);
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('creatorMap' in $$props) $$invalidate(1, creatorMap = $$props.creatorMap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		creatorMap,
    		creatorKeys,
    		selectChanged,
    		extraDataChanged,
    		enumInput,
    		delEnum,
    		selectorId,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class Selector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { selectorId: 7, data: 0, creatorMap: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Selector",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectorId*/ ctx[7] === undefined && !('selectorId' in props)) {
    			console_1.warn("<Selector> was created without expected prop 'selectorId'");
    		}

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console_1.warn("<Selector> was created without expected prop 'data'");
    		}

    		if (/*creatorMap*/ ctx[1] === undefined && !('creatorMap' in props)) {
    			console_1.warn("<Selector> was created without expected prop 'creatorMap'");
    		}
    	}

    	get selectorId() {
    		throw new Error("<Selector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectorId(value) {
    		throw new Error("<Selector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Selector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Selector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get creatorMap() {
    		throw new Error("<Selector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set creatorMap(value) {
    		throw new Error("<Selector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\line.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1 } = globals;
    const file = "src\\line.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (104:8) {#each columns as column (column.id)}
    function create_each_block_1(key_1, ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let div0_data_item_value;
    	let t1;
    	let selector;
    	let current;
    	let mounted;
    	let dispose;

    	selector = new Selector({
    			props: {
    				creatorMap: /*creatorMap*/ ctx[9],
    				data: /*column*/ ctx[17],
    				selectorId: /*column*/ ctx[17].id
    			},
    			$$inline: true
    		});

    	selector.$on("valueChanged", /*selectorHandle*/ ctx[8]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("删除");
    			t1 = space();
    			create_component(selector.$$.fragment);
    			attr_dev(div0, "class", "del svelte-1pxjp9d");
    			attr_dev(div0, "data-item", div0_data_item_value = /*column*/ ctx[17].id);
    			add_location(div0, file, 105, 12, 3301);
    			attr_dev(div1, "class", "line svelte-1pxjp9d");
    			add_location(div1, file, 104, 8, 3269);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			mount_component(selector, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*del*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!current || dirty & /*columns*/ 1 && div0_data_item_value !== (div0_data_item_value = /*column*/ ctx[17].id)) {
    				attr_dev(div0, "data-item", div0_data_item_value);
    			}

    			const selector_changes = {};
    			if (dirty & /*columns*/ 1) selector_changes.data = /*column*/ ctx[17];
    			if (dirty & /*columns*/ 1) selector_changes.selectorId = /*column*/ ctx[17].id;
    			selector.$set(selector_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(selector);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(104:8) {#each columns as column (column.id)}",
    		ctx
    	});

    	return block;
    }

    // (117:8) {#each lines as line}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*line*/ ctx[14] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(div, file, 117, 12, 3645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lines*/ 8 && t0_value !== (t0_value = /*line*/ ctx[14] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(117:8) {#each lines as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let div0;
    	let span0;
    	let t7;
    	let input0;
    	let t8;
    	let div1;
    	let span1;
    	let t10;
    	let input1;
    	let t11;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t12;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*column*/ ctx[17].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*lines*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "增加";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "生成";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "下载 csv";
    			t5 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "分隔符";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "生成数据量";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t12 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(button0, file, 92, 4, 2907);
    			add_location(button1, file, 93, 4, 2947);
    			add_location(button2, file, 94, 4, 2992);
    			add_location(span0, file, 96, 8, 3056);
    			add_location(input0, file, 97, 4, 3078);
    			add_location(div0, file, 95, 4, 3041);
    			add_location(span1, file, 100, 8, 3143);
    			add_location(input1, file, 101, 4, 3168);
    			add_location(div1, file, 99, 4, 3128);
    			add_location(div2, file, 115, 4, 3594);
    			add_location(div3, file, 91, 0, 2896);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, button0);
    			append_dev(div3, t1);
    			append_dev(div3, button1);
    			append_dev(div3, t3);
    			append_dev(div3, button2);
    			append_dev(div3, t5);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t7);
    			append_dev(div0, input0);
    			set_input_value(input0, /*splitChar*/ ctx[1]);
    			append_dev(div3, t8);
    			append_dev(div3, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t10);
    			append_dev(div1, input1);
    			set_input_value(input1, /*dataCount*/ ctx[2]);
    			append_dev(div3, t11);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div3, null);
    			}

    			append_dev(div3, t12);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*add*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*generate*/ ctx[7], false, false, false),
    					listen_dev(button2, "click", /*download*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*splitChar*/ 2 && input0.value !== /*splitChar*/ ctx[1]) {
    				set_input_value(input0, /*splitChar*/ ctx[1]);
    			}

    			if (dirty & /*dataCount*/ 4 && input1.value !== /*dataCount*/ ctx[2]) {
    				set_input_value(input1, /*dataCount*/ ctx[2]);
    			}

    			if (dirty & /*creatorMap, columns, selectorHandle, del*/ 833) {
    				each_value_1 = /*columns*/ ctx[0];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div3, outro_and_destroy_block, create_each_block_1, t12, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*lines*/ 8) {
    				each_value = /*lines*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function step(origin, step) {
    	return origin + step;
    }

    function dateStep(step) {
    	return new Date().getTime() + step * 1000 * 60;
    }

    function randomNumber(_, count) {
    	const numbers = '0123456789';
    	let result = '';

    	for (let i = 0; i < count; i++) {
    		result += numbers[Math.round(Math.random() * (numbers.length - 1))];
    	}

    	return result;
    }

    function randomString(_, count) {
    	const chars = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	let result = '';

    	for (let i = 0; i < count; i++) {
    		result += chars[Math.round(Math.random() * (chars.length - 1))];
    	}

    	return result;
    }

    function holdon(_, value) {
    	return value;
    }

    function enums(_, enums) {
    	const values = Object.keys(enums);
    	return values[Math.round(Math.random() * (values.length - 1))];
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Line', slots, []);
    	let columns = [];
    	let id = 0;
    	let splitChar = '|';
    	let dataCount = 50;

    	function add() {
    		const column = {
    			id: 'col' + id++,
    			creatorKey: undefined,
    			extraData: undefined
    		};

    		$$invalidate(0, columns = [...columns, column]);
    	}

    	function download() {
    		let a = document.createElement("a");
    		let file = new Blob([lines.join('\n')], { type: 'text' });
    		a.href = URL.createObjectURL(file);
    		a.download = 'data.csv';
    		a.click();
    	}

    	function del(event) {
    		const colId = event.target.dataset.item;
    		const colIndex = columns.findIndex(col => col.id === colId);
    		const temp = [...columns];
    		temp.splice(colIndex, 1);
    		$$invalidate(0, columns = temp);
    	}

    	let lines = [];

    	function generate() {
    		$$invalidate(3, lines = new Array(dataCount || 50).fill(1).map((_, index) => {
    			return columns.map(column => {
    				return creatorMethods[column.creatorKey](index, column.extraData);
    			}).join(splitChar || ',');
    		}));
    	}

    	function selectorHandle(event) {
    		const { creatorKey, extraData, selectorId } = event.detail;
    		const findColIndex = columns.findIndex(column => column.id === selectorId);

    		$$invalidate(
    			0,
    			columns[findColIndex] = {
    				id: columns[findColIndex].id,
    				creatorKey: creatorKey ?? columns[findColIndex].creatorKey,
    				extraData: extraData ?? columns[findColIndex].extraData
    			},
    			columns
    		);
    	}

    	const creatorMethods = {
    		step,
    		dateStep,
    		randomString,
    		randomNumber,
    		holdon,
    		enums
    	};

    	const creatorMap = {
    		dateStep: "时间戳递增",
    		randomString: "随机字符串（a-z，0-9）",
    		randomNumber: "随机数字（0-9）",
    		holdon: "保持输入值不变",
    		enums: "从枚举中选择一个"
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		splitChar = this.value;
    		$$invalidate(1, splitChar);
    	}

    	function input1_input_handler() {
    		dataCount = this.value;
    		$$invalidate(2, dataCount);
    	}

    	$$self.$capture_state = () => ({
    		Selector,
    		columns,
    		id,
    		splitChar,
    		dataCount,
    		add,
    		download,
    		del,
    		lines,
    		generate,
    		selectorHandle,
    		step,
    		dateStep,
    		randomNumber,
    		randomString,
    		holdon,
    		enums,
    		creatorMethods,
    		creatorMap
    	});

    	$$self.$inject_state = $$props => {
    		if ('columns' in $$props) $$invalidate(0, columns = $$props.columns);
    		if ('id' in $$props) id = $$props.id;
    		if ('splitChar' in $$props) $$invalidate(1, splitChar = $$props.splitChar);
    		if ('dataCount' in $$props) $$invalidate(2, dataCount = $$props.dataCount);
    		if ('lines' in $$props) $$invalidate(3, lines = $$props.lines);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		columns,
    		splitChar,
    		dataCount,
    		lines,
    		add,
    		download,
    		del,
    		generate,
    		selectorHandle,
    		creatorMap,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */

    function create_fragment(ctx) {
    	let line;
    	let current;
    	line = new Line({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(line.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(line, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Line });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
