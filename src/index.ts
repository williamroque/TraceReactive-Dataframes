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
import { ShowTableNode } from './nodes/ShowTableNode';
import type { TraceReactiveAPI } from '@tracereactive/types';
import * as aq from 'arquero';

declare const traceReactive: TraceReactiveAPI;

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
    new WriteJSONNode(),
    new ShowTableNode()
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

traceReactive.onEvaluateNode(async ({ typeId, inputs, properties }: any) => {
    const node = nodes.find(n => n.typeId === typeId);
    if (!node) {
        throw new Error(`Unknown node type: ${typeId}`);
    }

    const deserialize = (obj: any): any => {
        if (!obj) return obj;
        if (obj.__arqueroData) {
            return aq.from(obj.__arqueroData);
        }
        if (Array.isArray(obj)) return obj.map(deserialize);
        if (typeof obj === 'object') {
            const res: any = {};
            for (const k in obj) res[k] = deserialize(obj[k]);
            return res;
        }
        return obj;
    };

    const serialize = (obj: any): any => {
        if (!obj) return obj;
        // Duck-type check for Arquero table
        if (typeof obj.numRows === 'function' && typeof obj.columnNames === 'function') {
            return { __arqueroData: obj.objects() };
        }
        if (Array.isArray(obj)) return obj.map(serialize);
        if (typeof obj === 'object') {
            const res: any = {};
            for (const k in obj) res[k] = serialize(obj[k]);
            return res;
        }
        return obj;
    };

    const parsedInputs = deserialize(inputs);
    const result = await node.evaluate(parsedInputs, properties);
    return serialize(result);
});
