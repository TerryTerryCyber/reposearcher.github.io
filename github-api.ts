import type { Repository, RepoContent } from "./types"

const GITHUB_API_URL = "https://api.github.com"

export async function searchRepositories(query: string): Promise<Repository[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=12`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    },
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  return data.items
}

export async function getRepoContents(owner: string, repo: string, path = ""): Promise<RepoContent[]> {
  const url = path
    ? `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`
    : `${GITHUB_API_URL}/repos/${owner}/${repo}/contents`

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : [data]
}

export async function getFileContent(owner: string, repo: string, path: string): Promise<string> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  // GitHub API returns file content as base64 encoded
  if (data.encoding === "base64" && data.content) {
    return atob(data.content.replace(/\n/g, ""))
  }

  throw new Error("Unsupported file encoding")
}

