import { BaseNode } from '@tracereactive/types';
import * as aq from 'arquero';

export class SliceNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'sliceRows';
    readonly displayName = 'Slice Rows';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' },
        { name: 'Start', acceptsType: 'core:number' },
        { name: 'End', acceptsType: 'core:number' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'start',
            label: 'Start Index',
            description: 'Zero-based index to begin slice',
            type: 'number' as const,
            defaultValue: 0
        },
        {
            name: 'end',
            label: 'End Index',
            description: 'Zero-based index before which to end slice',
            type: 'number' as const,
            defaultValue: 10
        },
        {
            name: 'useEnd',
            label: 'Specify End Index',
            description: 'If disabled, slice extends to the end of dataframe',
            type: 'boolean' as const,
            defaultValue: false
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};

        const start = inputs['Start'] !== undefined && inputs['Start'] !== null ? Number(inputs['Start']) : Number(properties['start'] || 0);

        const hasEndInput = inputs['End'] !== undefined && inputs['End'] !== null;
        const useEnd = hasEndInput || properties['useEnd'] === true;

        try {
            let newTable;
            if (useEnd) {
                const end = hasEndInput ? Number(inputs['End']) : Number(properties['end'] || 0);
                newTable = table.slice(start, end);
            } else {
                newTable = table.slice(start);
            }
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to slice rows:', err);
            return {};
        }
    }
}
