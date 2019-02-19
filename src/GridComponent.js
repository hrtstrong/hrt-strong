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

function groupCaption(props) {

    let ret = props.field === "teamSort" || props.field === "userSort" ?  props.key.split("-")[1] : props.key;
    if (props.field === "teamSort") {
        return (<span style={{fontWeight:"bold"}}>{ret}</span>);
    }
    return (<span>{ret}</span>);
}

export class MyGridComponent extends Component {
    constructor(props) {
        super();
        this.insertedListeners = false;
        props.updater.subscribeUpdate(this);
    }

    onUpdate() {
        if (this.grid) {
            this.grid.refresh();
        }
    }

    captionSum(props) {
        let ret = Math.round(Number((String(props.Sum)).replace(",","")));
        if (props.field === "teamSort") {
            return (<span style={{fontWeight:"bold"}}>{ret}</span>);
        }
        return (<span>{ret}</span>);
    }

    collapseLeaves() {
        for(let currentTr of this.grid.getRows() ) {
            while (currentTr.classList && currentTr.classList.length){
                currentTr = currentTr.previousSibling;
            }
            let collapseElement = currentTr.querySelector('.e-recordplusexpand');
            this.grid.groupModule.expandCollapseRows(collapseElement); //Pass the collapse row element.
        }
    }

    clickHandler(args: any) {
        console.log(args.item.id);
        if (args.item.id === 'expandall') {
            this.grid.groupModule.expandAll();
        }
        if(args.item.id === "collapseall"){
            this.grid.groupModule.collapseAll();
        }

        if(args.item.id === "collapseLeaves"){
            this.collapseLeaves();
        }
    }

    render() {
        return (<div className='control-pane'>
                <style>{SAMPLE_CSS}</style>
                <div className='control-section'>
                <GridComponent
                dataSource={this.props.dataSource}
                enableVirtualization={false}
                //height="800"
                gridLines="Both"
                columns={[
                    {field : "teamName",  headerText: "Team", visible:false},
                    {field : "userName",  headerText: "Member", visible:false},
                    {field : "activityName",  headerText: "Activity"},
                    {field : "activity", headerText: "activityId", visible:false},
                    {field : "points",    headerText: "Points", format:"N1", textAlign: "Right"},
                    {field : "date",      headerText: "Date", format:ISO_DATE, enableGroupByFormat:true, textAlign: "Center"},
                    {field : "spirit",    headerText: "Spirit?", displayAsCheckBox: true, textAlign: "Center", visible:true},
                    {field : "duration",  headerText: "Duration / Distance", format:"N0", textAlign: "Right", visible:true},

                    {field : "createTime",headerText: "Log Time", visible:false},
                    {field : "email",     headerText: "User Id", visible:false},

                    {field : "rawPoints", headerText: "Raw Points", format:"N1", textAlign: "Right", visible:true},
                    {field : "dayPoints", headerText: "Day Points", format:"N1", textAlign: "Right", visible:true},
                    {field : "bonusPoints", headerText: "Bonus Points", format:"N1", textAlign: "Right", visible:true},
                    {field : "spiritPoints", headerText: "Spirit Points", format:"N1", textAlign: "Right", visible:true},
                    {field : "reasons", headerText: "Adjustment Reasons", visible:true},
                    {field : "teamSort", headerText : "Team"},
                    {field : "userSort", headerText : "Member"}
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
                    showGroupedColumn: false,
                    captionTemplate: groupCaption,
                    columns:["teamSort","userSort"]
                }}
                sortSettings={{
                    columns:[{field:"teamSort",direction:"Descending"}, {field:"userSort",direction:"Descending"}]
                }}
                searchSettings={{ignoreCase:true}}
                toolbar={[
                    "Search", "ColumnChooser",
                    { text: 'Expand All', tooltipText: 'Expand All', prefixIcon: 'e-expand', id: 'expandall' },
                    { text: 'Collapse All', tooltipText: 'collection All', prefixIcon: 'e-collapse', id: 'collapseall' },
                    { text: 'Collapse Leaves', tooltipText: 'collection All', prefixIcon: 'e-collapse', id: 'collapseLeaves' },
                    { text: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', id: 'spacer', align:"Right" },
                ]}
                toolbarClick={this.clickHandler.bind(this)}
                ref={ g => {
                    this.grid = g;
                    window.grid = g;

                    g.isPersistSelection = true;
                    g.reactController = this;
                }}
                dataBound={ () => {
                    if (!this.insertedListeners) {

                        this.grid.localObserver.on("refresh-complete", () => {
                            console.log("refresh complete, setting collapse timer");
                            if (this.collapseTimer) {
                                clearTimeout(this.collapseTimer);
                            }
                            this.collapseTimer = setTimeout(() => {
                                console.log("collapsing leaves");
                                //this.collapseLeaves();
                                this.collapseTimer = null;
                            }, 1);
                        });

                        this.insertedListeners = true;
                    }
                }}
                dataStateChange={ x => {
                    console.log("dataStateChange", arguments);
                }}
                >
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
