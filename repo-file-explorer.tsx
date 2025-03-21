"use client"

import { useState, useEffect } from "react"
import { Folder, File, ChevronRight, ChevronDown, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getRepoContents, getFileContent } from "@/lib/github-api"
import type { Repository, RepoContent } from "@/lib/types"

interface RepoFileExplorerProps {
  repository: Repository
}

export function RepoFileExplorer({ repository }: RepoFileExplorerProps) {
  const [contents, setContents] = useState<RepoContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [folderContents, setFolderContents] = useState<Record<string, RepoContent[]>>({})
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({})
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchRootContents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const rootContents = await getRepoContents(repository.owner.login, repository.name)
        setContents(rootContents)
      } catch (err) {
        setError("Failed to fetch repository contents. Please try again.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRootContents()
  }, [repository])

  const toggleFolder = async (path: string) => {
    const isExpanded = expandedFolders[path]

    setExpandedFolders({
      ...expandedFolders,
      [path]: !isExpanded,
    })

    if (!isExpanded && !folderContents[path]) {
      setLoadingFolders({
        ...loadingFolders,
        [path]: true,
      })

      try {
        const contents = await getRepoContents(repository.owner.login, repository.name, path)
        setFolderContents({
          ...folderContents,
          [path]: contents,
        })
      } catch (err) {
        console.error(`Failed to fetch contents for ${path}:`, err)
      } finally {
        setLoadingFolders({
          ...loadingFolders,
          [path]: false,
        })
      }
    }
  }

  const downloadFile = async (path: string, fileName: string) => {
    setDownloadingFiles({
      ...downloadingFiles,
      [path]: true,
    })

    try {
      const content = await getFileContent(repository.owner.login, repository.name, path)

      // Create a blob and download link
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Failed to download file ${path}:`, err)
    } finally {
      setDownloadingFiles({
        ...downloadingFiles,
        [path]: false,
      })
    }
  }

  const renderFileItem = (item: RepoContent, depth = 0) => {
    const isFolder = item.type === "dir"
    const isExpanded = expandedFolders[item.path]
    const folderIsLoading = loadingFolders[item.path]
    const fileIsDownloading = downloadingFiles[item.path]

    return (
      <div key={item.path}>
        <div className={`flex items-center py-2 px-2 hover:bg-muted rounded-md ${depth > 0 ? "ml-6" : ""}`}>
          {isFolder ? (
            <Button variant="ghost" size="icon" className="h-6 w-6 mr-2" onClick={() => toggleFolder(item.path)}>
              {folderIsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {isFolder ? (
            <Folder className="h-4 w-4 mr-2 text-blue-500" />
          ) : (
            <File className="h-4 w-4 mr-2 text-gray-500" />
          )}

          <span className="flex-grow truncate">{item.name}</span>

          {!isFolder && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-2"
              onClick={() => downloadFile(item.path, item.name)}
              disabled={fileIsDownloading}
            >
              {fileIsDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {isFolder && isExpanded && (
          <div className="ml-6">
            {folderIsLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : folderContents[item.path]?.length > 0 ? (
              folderContents[item.path].map((childItem) => renderFileItem(childItem, depth + 1))
            ) : (
              <div className="py-2 text-muted-foreground">Empty folder</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium mb-4">Repository Files</h3>
      <div className="max-h-[500px] overflow-y-auto">
        {contents.length > 0 ? (
          contents.map((item) => renderFileItem(item))
        ) : (
          <div className="text-center py-8 text-muted-foreground">This repository is empty.</div>
        )}
      </div>
    </div>
  )
}

