"use server";

import {GithubLinkType, type GitHubRepoTree, type RepoReference, TreeNode} from "../models/manager.models";
import {isImportantFile} from "@/app/manager/filemanager";
import {getAiSummary} from "@/app/ai/actions";
import {headers} from "next/headers";

/**
 * Get github repo info
 *
 * @param link Github link to fetch details
 * @returns GitHubRepoTree or null incase of not found or error
 */
export async function getGithubRepoInfo(link: string): Promise<GitHubRepoTree | null> {
    "use server";

    // Get Rep reference to work with
    const repoRef = await getRepoReference(link)
    console.log("Got Repo reference")

    // If fails to get repo reference that means we can't process further
    if (repoRef === null) {
        return null
    }

    // Get github repo content
    const result = await getGithubRepoTree(repoRef)
    console.log("Got Repo result", result)

    // If fails to get result that means we can't process further
    if (result === null) {
        return null
    }

    const newTree = result.tree.filter(node => node.type === 'blob').filter(node => isImportantFile(node))
    const filteredResult: GitHubRepoTree = {
        ...result,
        tree: newTree,
    }

    console.log(JSON.stringify(filteredResult, null, 4))
    return filteredResult
}

/**
 * Get github repo reference from link
 *
 * @param link Link to get reference of
 * @returns RepoReference or null incase of error
 */
export async function getRepoReference(link: string): Promise<RepoReference | null> {
    "use server";

    console.log("Getting Repo reference")

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
 * Get complete summary of the repo
 *
 * @param content GitHubRepoTree
 */
export async function getCompleteSummary(content: GitHubRepoTree) {
    const filesContents = []
    for (const file of content.tree) {
        filesContents.push(getSummary(file))
    }
    return await Promise.all(filesContents)
}

async function getSummary(file: TreeNode): Promise<[string, string, string | null]> {
    const response = await fetch(file.url, {
        headers: {
            'Accept': 'application/vnd.github.raw+json',
            'Authorization': `Bearer ${process.env.GITHUB_PAT}`
        }
    })
    const data = await response.text()
    const size = response.headers.get('Content-Length') ?? "0"
    return [file.path, data, await getAiSummary(size, file, data)]
}

/**
 * Get github repo tree
 *
 * @param repoRef RepoReference
 * @returns GitHubRepoTree or null incase of error
 */
async function getGithubRepoTree(repoRef: RepoReference): Promise<GitHubRepoTree | null> {
    // Forms the url and fetch content from github
    const url = `https://api.github.com/repos/${repoRef.username}/${repoRef.repo}/git/trees/HEAD?recursive=true`
    console.log(url)
    const response = await fetch(
        url,
        {
            cache: "no-cache",
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_PAT}`
            }
        })
    console.log(response)

    // If not successful, we abort
    if (response.status !== 200) {
        return null
    }

    // Returns the response as GitHubRepoTree
    console.log(JSON.stringify(response, null, 4))
    return response.json()
}

/**
 * Get default branch of github repo
 *
 * @param repoRef
 */
async function getDefaultBranch(repoRef: RepoReference): Promise<string | null> {
    const url = `https://api.github.com/repos/${repoRef.username}/${repoRef.repo}`
    const response = await fetch(url)
    const data: DefaultBranch = await response.json()
    if (response.status !== 200) {
        return null
    }
    return data.default_branch
}

interface DefaultBranch {
    default_branch: string
}