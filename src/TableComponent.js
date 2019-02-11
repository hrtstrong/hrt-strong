import { Component } from 'react';
import './index.css';
import * as React from 'react';
import { PivotViewComponent } from '@syncfusion/ej2-react-pivotview';

const SAMPLE_CSS = `
.e-pivotview {
    width: 100%;
    height: 100%;
}`;
x

export class TableComponent extends Component {
    constructor(props) {
        super();
        this.dm = props.dm;
        this.settings = {
            data: props.dataSource,
            rows: [
                {name : "email"},
                {name : "createTime"}
            ],

            values: [
                {name : "duration"},
                {name : "duration"}
            ],

            columns: [

            ],

            expandAll: false
        }

        props.updater.subscribeUpdate(this);
    }

    onUpdate() {
        if (this.grid) {
            this.grid.dataSource.data = this.dm.dataSource.json;
            this.grid.refresh();
        }
    }

    render() {
        return (<div className='control-pane'>
                <style>{SAMPLE_CSS}</style>
                <div className='control-section' style={{ overflow: 'auto' }}>
                <PivotViewComponent id='PivotView'
                dataSource={this.settings}
                ref={
                    g => {
                        this.grid = g;
                        window.grid = g;
                    }
                } >
                </PivotViewComponent>
                </div>
                </div>);
    }
}

export default TableComponent;
