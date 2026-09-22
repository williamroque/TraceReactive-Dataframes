import { ExecuteNode } from '@tracereactive/types';
import * as aq from 'arquero';
import * as XLSX from 'xlsx';

import type { TraceReactiveAPI } from '@tracereactive/types';

declare const traceReactive: TraceReactiveAPI;

export class ReadExcelNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'readExcel';
    readonly displayName = 'Read Excel';
    readonly visible = true;
    readonly inputs = [
        { name: 'Path', acceptsType: 'core:path', required: false }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        { 
            name: 'filePath', 
            label: 'File path', 
            type: 'filepath' as const, 
            defaultValue: '',
            filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
        },
        {
            name: 'sheetName',
            label: 'Sheet Name',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const filePath = (inputs.Path as string) || (properties.filePath as string);
        if (!filePath) return {};
        try {
            const binaryData = await traceReactive.fs.readFile(filePath, 'binary');
            
            const workbook = XLSX.read(binaryData, { type: 'binary' });
            
            const sheetName = properties.sheetName || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            if (!worksheet) {
                console.error(`Sheet ${sheetName} not found.`);
                return {};
            }
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const table = aq.from(jsonData);
            
            return { Data: table };
        } catch (err) {
            console.error('Failed to read Excel:', err);
            return {};
        }
    }
}
