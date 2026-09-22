import { TableEditorFrontend } from './frontends/TableEditorFrontend';

declare const window: any;

if (window.TraceReactiveUI && window.TraceReactiveUI.registerInteractiveFrontend) {
    window.TraceReactiveUI.registerInteractiveFrontend({
        typeIds: ['dataframes:tableEditor'],
        component: TableEditorFrontend,
        packageId: 'com.tracereactive.dataframes'
    });
}
