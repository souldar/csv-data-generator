<script>
    import Selector from "./selector.svelte";
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
        columns = [...columns, column];
    }
    function download () {
        let a = document.createElement("a")
        let file = new Blob([lines.join('\n')], {type: 'text'})
        a.href = URL.createObjectURL(file)
        a.download = 'data.csv'
        a.click()
    }
    function del(event) {
        const colId = event.target.dataset.item
        const colIndex = columns.findIndex(col => col.id === colId)
        const temp = [...columns]
        temp.splice(colIndex, 1)
        columns = temp
    }
    let lines = []
    function generate() {
        lines = new Array(dataCount || 50).fill(1).map((_, index) => {
            return columns.map(column => {
                return creatorMethods[column.creatorKey](index, column.extraData)
            }).join(splitChar || ',')
        })
    }
    function selectorHandle(event) {
        const { creatorKey, extraData, selectorId } = event.detail;
        const findColIndex = columns.findIndex((column) => column.id === selectorId)
        columns[findColIndex] = {
            id: columns[findColIndex].id,
            creatorKey: creatorKey ?? columns[findColIndex].creatorKey, 
            extraData: extraData ?? columns[findColIndex].extraData
        }
    }
    function step(origin, step) {
        return origin + step;
    }
    function dateStep(step) {
        return new Date().getTime() + step * 1000 * 60
    }
    function randomNumber(_, count) {
        const numbers = '0123456789'
        let result = ''
        for(let i = 0; i < count; i++) {
            result += numbers[Math.round(Math.random() * (numbers.length - 1))]
        }
        return result
    }
    function randomString(_, count) {
        const chars = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let result = ''
        for(let i = 0; i < count; i++) {
            result += chars[Math.round(Math.random() * (chars.length - 1))]
        }
        return result
    }
    function holdon(_, value) {
        return value
    }
    function enums(_, enums) {
        const values = Object.keys(enums)
        return values[Math.round(Math.random() * (values.length - 1))]
    }
    const creatorMethods = {
        step,
        dateStep,
        randomString,
        randomNumber,
        holdon,
        enums
    }
    const creatorMap = {
        dateStep: "时间戳递增",
        randomString: "随机字符串（a-z，0-9）",
        randomNumber: "随机数字（0-9）",
        holdon: "保持输入值不变",
        enums: "从枚举中选择一个"
    };
</script>

<div>
    <button on:click={add}>增加</button>
    <button on:click={generate}>生成</button>
    <button on:click={download}>下载 csv</button>
    <div>
        <span>分隔符</span>
    <input bind:value={splitChar} />
    </div>
    <div>
        <span >生成数据量</span>
    <input bind:value={dataCount} />
    </div>
        {#each columns as column (column.id)}
        <div class="line">
            <div class="del" on:click={del} data-item={column.id}>删除</div>
            <Selector
                {creatorMap}
                data={column}
                selectorId={column.id}
                on:valueChanged={selectorHandle}
            />
        </div>
        {/each}

    <div >
        {#each lines as line}
            <div>
                {line}
            </div>
        {/each}
    </div>
</div>

<style>
    .line {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 10px 0;
    }
    .del {
        border: .5px solid #efefef;
        background-color: tomato;
        color: white;
        padding: 5px;
        margin-right: 10px;
    }
</style>