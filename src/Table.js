export class Table {
    constructor(dm) {
        this.dm = dm;
        this.settings = {
            data: this.dm,
            rows: [
                { name: 'email' }
            ],
            columns: [
                //{ name: 'activity' }
            ],
            values: [
                { name: 'duration' },
                { name: "duration" }
            ],
            valueSortSettings: { headerDelimiter: ' - ' },
            formatSettings: [{ name: 'duration', format: 'C0' }],
            enableSorting: true,
            expandAll: false,
            filters: []
        };
    }
}

export default Table;
