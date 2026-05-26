export type ExtensionAction = 'approve' | 'reject';
export declare class DecideExtensionDto {
    action: ExtensionAction;
    overrideDate?: string;
    decisionNote?: string;
}
