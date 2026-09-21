import { ReadCSVNode } from './nodes/ReadCSVNode';
import { ReadExcelNode } from './nodes/ReadExcelNode';
import { TableInfoNode } from './nodes/TableInfoNode';
import { SelectColumnsNode } from './nodes/SelectColumnsNode';
import { DropColumnsNode } from './nodes/DropColumnsNode';
import { RenameColumnsNode } from './nodes/RenameColumnsNode';
import { MutateColumnNode } from './nodes/MutateColumnNode';
import { CastTypeNode } from './nodes/CastTypeNode';
import { FilterRowsNode } from './nodes/FilterRowsNode';
import { SortRowsNode } from './nodes/SortRowsNode';
import { DropDuplicatesNode } from './nodes/DropDuplicatesNode';
import { HandleMissingValuesNode } from './nodes/HandleMissingValuesNode';
import { ExtractColumnNode } from './nodes/ExtractColumnNode';
import { PackColumnsNode } from './nodes/PackColumnsNode';
import { GroupByNode } from './nodes/GroupByNode';
import { MergeNode } from './nodes/MergeNode';
import { ConcatNode } from './nodes/ConcatNode';
import { PivotNode } from './nodes/PivotNode';
import { DescribeNode } from './nodes/DescribeNode';
import { WriteCSVNode } from './nodes/WriteCSVNode';
import { WriteExcelNode } from './nodes/WriteExcelNode';
import { WriteJSONNode } from './nodes/WriteJSONNode';
import { TablePreviewer } from './previewers/TablePreviewer';

declare const traceReactive: any;

const nodes = [
    new ReadCSVNode(),
    new ReadExcelNode(),
    new TableInfoNode(),
    new SelectColumnsNode(),
    new DropColumnsNode(),
    new RenameColumnsNode(),
    new MutateColumnNode(),
    new CastTypeNode(),
    new FilterRowsNode(),
    new SortRowsNode(),
    new DropDuplicatesNode(),
    new HandleMissingValuesNode(),
    new ExtractColumnNode(),
    new PackColumnsNode(),
    new GroupByNode(),
    new MergeNode(),
    new ConcatNode(),
    new PivotNode(),
    new DescribeNode(),
    new WriteCSVNode(),
    new WriteExcelNode(),
    new WriteJSONNode()
];

const serializableNodes = nodes.map(n => ({
    typeId: n.typeId,
    displayName: n.displayName,
    category: n.category,
    nodeInterface: n.nodeInterface,
    visible: n.visible,
    inputs: n.inputs,
    outputs: n.outputs,
    properties: n.properties,
    dynamicInputs: n.dynamicInputs,
    dynamicOutputs: n.dynamicOutputs
}));

traceReactive.registerNodes(serializableNodes);

traceReactive.registerPreviewers([
    {
        typeIds: ['core:dataframe'],
        component: TablePreviewer,
        packageId: 'com.tracereactive.dataframes'
    }
]);

traceReactive.onEvaluateNode(async ({ typeId, inputs, properties }: any) => {
    const node = nodes.find(n => n.typeId === typeId);
    if (!node) {
        throw new Error(`Unknown node type: ${typeId}`);
    }
    return await node.evaluate(inputs, properties);
});
