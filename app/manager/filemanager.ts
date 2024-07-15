import {TreeNode} from "@/app/models/manager.models";

const binaryExtensions = new Set([
    'exe', 'bin', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'avi', 'mov',
    'pdf', 'zip', 'rar', '7z', 'tar', 'gz', 'iso', 'dmg', 'dll', 'class', 'jar', 'ico'
])

function getFileExtension(fileName: string) {
    return fileName.split('.').pop()?.toLowerCase()
}

export function isNotBinary(node: TreeNode): boolean {
    const extension = getFileExtension(node.path)
    return !binaryExtensions.has(extension ?? "")
}