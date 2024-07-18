import {TreeNode} from "@/app/models/manager.models";

const nonImportantFileExtensions = new Set([
    'exe', 'bin', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'avi', 'mov',
    'pdf', 'zip', 'rar', '7z', 'tar', 'gz', 'iso', 'dmg', 'dll', 'class', 'jar', 'ico'
])

function getFileExtension(fileName: string) {
    return fileName.split('.').pop()?.toLowerCase()
}

export function isImportantFile(node: TreeNode): boolean {
    const extension = getFileExtension(node.path)
    return !nonImportantFileExtensions.has(extension ?? "") && !shouldIgnoreFile(node)
}

function shouldIgnoreFile(node: TreeNode): boolean {
    const fileName = node.path.split("/").pop()
    if (fileName === undefined) return false
    return filesToIgnore.has(fileName)
}

const filesToIgnore = new Set([
    'package-lock.json'
])