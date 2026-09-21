import { ExecuteNode } from '@tracereactive/types';
import * as aq from 'arquero';

declare const traceReactive: any;

export class ReadCSVNode extends ExecuteNode {
    readonly category = { name: 'Data', accent: 'emerald-500' } as any;
    readonly typeId = 'readCsv';
    readonly displayName = 'Read CSV';
    readonly visible = true;
    readonly inputs = [];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        { 
            name: 'filePath', 
            label: 'File path', 
            type: 'filepath' as const, 
            defaultValue: '',
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        },
        {
            name: 'hasHeader',
            label: 'Has Header',
            type: 'boolean' as const,
            defaultValue: true
        },
        {
            name: 'delimiter',
            label: 'Delimiter',
            type: 'text' as const,
            defaultValue: ','
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const filePath = properties.filePath as string;
        if (!filePath) return {};
        try {
            const csvText = await traceReactive.fs.readFile(filePath, 'utf-8');
            const table = aq.fromCSV(csvText, { 
                header: properties.hasHeader !== false, 
                delimiter: properties.delimiter || ',' 
            });
            return { Data: table };
        } catch (err) {
            console.error('Failed to read CSV:', err);
            return {};
        }
    }
}
