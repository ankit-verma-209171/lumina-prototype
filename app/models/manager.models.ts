/**
 * Represents link types of Github
 */
export enum GithubLinkType {
    HttpLink,
    SshLink
}

/**
 * Represents reference to github repo
 */
export type RepoReference = {
    type: GithubLinkType,
    repo: string,
    username: string,
}

/**
 * Represents content of github repo
 */
export interface GitHubRepoTree {
    sha: string;
    url: string;
    tree: TreeNode[];
    truncated: boolean;
}

export interface TreeNode {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
    url: string;
}
