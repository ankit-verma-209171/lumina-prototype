export class ProjectRef {
    completeSummary: Map<string, string>;
    completeContent: Map<string, string>;

    constructor() {
        this.completeSummary = new Map<string, string>();
        this.completeContent = new Map<string, string>();
    }

    get json(): IProjectRef {
        return {
            completeSummary: this.completeSummary,
            completeContent: this.completeContent,
        };
    }
}

export interface IProjectRef {
    completeSummary: Map<string, string>;
    completeContent: Map<string, string>;
}