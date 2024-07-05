"use server";

import { GithubLinkType, type GitHubContent, type RepoReference } from "../models/manager.models";

/**
 * Get github repo info
 * 
 * @param link Github link to fetch details
 * @returns GitHubContent or null incase of not found or error
 */
export async function getGithubRepoInfo(link: string): Promise<GitHubContent | null> {
    "use server";

    // Get Rep reference to work with
    const repoRef = await getRepoReference(link)

    // If fails to get repo reference that means we can't process further
    if (repoRef === null) {
        return null
    }

    // Get github repo content
    const result = await getGithubContent(repoRef)
    // If fails to get result that means we can't process further
    if (result === null) {
        return null
    }

    console.log(JSON.stringify(result, null, 4))
    return result
}

/**
 * Get github repo reference from link
 * 
 * @param link Link to get reference of
 * @returns RepoReference or null incase of error
 */
export async function getRepoReference(link: string): Promise<RepoReference | null> {
    "use server";

    const httpsPattern = /^(https:\/\/github\.com\/)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(\.git)?\/?$/;
    const sshPattern = /^(git@github\.com:)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\.git$/;

    let match: RegExpMatchArray | null
    let type: GithubLinkType

    if (match = link.match(httpsPattern)) {
        type = GithubLinkType.HttpLink
    } else if (match = link.match(sshPattern)) {
        type = GithubLinkType.SshLink
    } else {
        return null
    }

    return {
        type: type,
        username: match[2],
        repo: match[3],
    }
}

/**
 * Get complete index of the repo
 * 
 * @param content GitHubContent
 */
export async function getCompleteIndex(content: GitHubContent) {
    // TODO: From here ...
}

/**
 * Get github content
 * 
 * @param repoRef RepoReference
 * @param path Path to the file content
 * @returns GitHubContent or null incase of error
 */
async function getGithubContent(repoRef: RepoReference, path: string = ""): Promise<GitHubContent | null> {
    // Forms the url and fetch content from github
    const baseUrl = "https://api.github.com/repos"
    const repoPath = repoRef.username + "/" + repoRef.repo
    const file = path === "" ? "" : `/content/${path}`
    const url = `${baseUrl}/${repoRef.username}/${repoRef.repo}${file}`
    console.log(url)
    const response = await fetch(url)

    // If not successful, we abort
    if (response.status !== 200) {
        return null
    }

    // Returns the response as GitHubContent
    console.log(JSON.stringify(response, null, 4))
    return response.json()
}
