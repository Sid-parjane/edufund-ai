export interface DeadLeadResult {
    isDead: boolean;
    reasons: string[];
    details: string;
}
export declare class DeadLeadDetector {
    static detect(app: any): DeadLeadResult;
}
