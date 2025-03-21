export interface Repository {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  html_url: string
  description: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  language: string | null
  default_branch: string
}

export interface RepoContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: "file" | "dir" | "symlink" | "submodule"
  content?: string
  encoding?: string
}

