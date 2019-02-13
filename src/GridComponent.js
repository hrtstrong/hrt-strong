import * as React from 'react';
import { Component } from 'react';
import {
    Aggregate,
    AggregateColumnDirective,
    AggregateColumnsDirective,
    AggregateDirective,
    AggregatesDirective,
    ColumnChooser,
    ColumnMenu,
    ContextMenu,
    Filter,
    GridComponent,
    Group,
    Inject,
    Reorder,
    Resize,
    Search,
    Sort,
    Toolbar,
    VirtualScroll
} from '@syncfusion/ej2-react-grids';

const SAMPLE_CSS = `
.e-summarycell-box {
  box-sizing: border-box;
  border-width: 1px 0 0 1px;

}
`;

const ISO_DATE = {type:'date', format:'yyyy-MM-dd'};

export class MyGridComponent extends Component {
    constructor(props) {
        super();
        props.updater.subscribeUpdate(this);
    }

    onUpdate() {
        if (this.grid) {
            this.grid.refresh();
        }
    }

    captionSum(props) {
        return (<span>{Math.round(Number((String(props.Sum)).replace(",","")))}</span>);
    }

    render() {
        return (<div className='control-pane'>
                <style>{SAMPLE_CSS}</style>
                <div className='control-section'>
                <GridComponent
                dataSource={this.props.dataSource}
                enableVirtualization={false}
                //height="400"
                gridLines="Both"
                columns={[
                    {field : "treeAgg",   headerText: "A"},
                    {field : "teamName",  headerText: "Team"},
                    {field : "userName",  headerText: "Member"},
                    {field : "activity",  headerText: "activity"},
                    {field : "points",    headerText: "Points", format:"N1", textAlign: "Right"},
                    {field : "spirit",    headerText: "Spirit?", displayAsCheckBox: true, textAlign: "Center"},
                    {field : "date",      headerText: "Date", format:ISO_DATE},

                    {field : "createTime",headerText: "Log Time"},
                    {field : "email",     headerText: "e-mail"},
                    {field : "duration",  headerText: "Duration", format:"N0", textAlign: "Right"},
                    {field : "rawPoints", headerText: "Raw Points", format:"N1", textAlign: "Right"},
                    {field : "dayPoints", headerText: "Day Points", format:"N1", textAlign: "Right"},
                    {field : "bonusPoints", headerText: "Spirit Points", format:"N1", textAlign: "Right"},
                    {field : "spiritPoints", headerText: "Bonus Points", format:"N1", textAlign: "Right"},
                    {field : "reasons" }
                ]}
                allowFiltering={true}
                allowGrouping={true}
                allowReordering={true}
                allowResizing={true}
                allowSearching={true}
                allowSorting={true}
                //enablePersistence={true}
                showColumnChooser={true}
                showColumnMenu={true}
                groupSettings={{
                    showGroupedColumn: false
                }}
                searchSettings={{ignoreCase:true}}
                toolbar={["Search", "ColumnChooser"]}
                ref={
                    g => {
                        this.grid = g;
                        window.grid = g;
                     }
                } >
                <AggregatesDirective>
                <AggregateDirective>
                <AggregateColumnsDirective>
                <AggregateColumnDirective field='rawPoints' type='Sum' format="N0" groupCaptionTemplate={this.captionSum} />
                <AggregateColumnDirective field='points' type='Sum' groupCaptionTemplate={this.captionSum} />
                <AggregateColumnDirective field='duration' type='Sum' groupCaptionTemplate={this.captionSum} />
                </AggregateColumnsDirective>
                </AggregateDirective>
                </AggregatesDirective>
                <Inject services={[
                    Aggregate,
                    ColumnChooser,
                    ColumnMenu,
                    ContextMenu,
                    Filter,
                    Group,
                    Reorder,
                    Resize,
                    Search,
                    Sort,
                    Toolbar,
                    VirtualScroll
                ]} />
                </GridComponent>
                </div>
                </div>);
    }
}

export default MyGridComponent;
