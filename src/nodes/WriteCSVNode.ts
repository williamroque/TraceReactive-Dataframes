import { ExecuteNode } from '@tracereactive/types';
import * as aq from 'arquero';

declare const traceReactive: any;

export class WriteCSVNode extends ExecuteNode {
    readonly category = { name: 'Data', accent: 'emerald-500' } as any;
    readonly typeId = 'writeCsv';
    readonly displayName = 'Write CSV';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [];
    readonly properties = [
        {
            name: 'filePath',
            label: 'Output File Path',
            type: 'filepath' as const,
            defaultValue: ''
        },
        {
            name: 'delimiter',
            label: 'Delimiter',
            type: 'text' as const,
            defaultValue: ','
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        const filePath = properties.filePath as string;
        
        if (!table || !filePath) return {};

        try {
            const csvStr = table.toCSV({ delimiter: properties.delimiter || ',' });
            await traceReactive.fs.writeFile(filePath, csvStr);
            return {};
        } catch (err) {
            console.error('Failed to write CSV:', err);
            return {};
        }
    }
}
