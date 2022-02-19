<script>
    import { createEventDispatcher } from "svelte";

    export let selectorId;
    export let data;
    export let creatorMap;
    const creatorKeys = Object.keys(creatorMap);
    const dispatch = createEventDispatcher();
    function valueChanged(key, value) {
        dispatch("valueChanged", {
            [key]: value,
            selectorId,
        });
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
                [event.target.value]: 1,
            });
            event.target.value = "";
        }
    }
    function delEnum(event) {
        const temp = { ...data.extraData };
        delete temp[event.target.dataset.item];
        valueChanged("extraData", temp);
    }
</script>

<div class='selector'>
    <select on:change={selectChanged} bind:value={data.creatorKey}>
        <option selected disabled hidden value={""}>选择数据类型</option>
        {#each creatorKeys as creatorKey}
            <option value={creatorKey}>{creatorMap[creatorKey]}</option>
        {/each}
    </select>
    {#if data.creatorKey === "randomString" || data.creatorKey === "randomNumber"}
        <input
            placeholder="数据长度"
            on:change={extraDataChanged}
            bind:value={data.extraData}
        />
    {:else if data.creatorKey === "holdon"}
        <input placeholder="输入不变的值" on:change={extraDataChanged} />
    {:else if data.creatorKey === "enums"}
        <input placeholder="输入可能的枚举" on:keyup={enumInput} />
        {#each Object.keys(data.extraData || {}) as Enum}
            <span class="tag">
                <span>{Enum} </span>
                <span class="close" data-item={Enum} on:click={delEnum}>X</span>
            </span>
        {/each}
    {/if}
</div>

<style>
    .tag {
        padding: 6px;
        border-radius: 4px;
        border: 0.5px #efefef solid;
        background-color: rgb(236, 246, 255);
        color: rgb(64, 158, 255);
    }
    .close {
        margin-left: 4px;
        font-size: 12px;
        user-select: none;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: inline-block;
        text-align: center;
    }
    .close:hover {
        background-color: #409eff;
        color: white;
    }
    select, input {
        margin:0;
    }
    .selector {
        display: flex;
        flex-direction: row;
        align-items: center;
    } 
</style>
