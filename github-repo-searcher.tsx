"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Star, GitFork, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RepoFileExplorer } from "./repo-file-explorer"
import { searchRepositories } from "@/lib/github-api"
import type { Repository } from "@/lib/types"

export function GitHubRepoSearcher() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const repos = await searchRepositories(searchQuery)
      setRepositories(repos)
      setSelectedRepo(null)
    } catch (err) {
      setError("Failed to fetch repositories. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo)
  }

  const handleBackToResults = () => {
    setSelectedRepo(null)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search GitHub repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {error && <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>}

      {selectedRepo ? (
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBackToResults}>
            ← Back to search results
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>{selectedRepo.name}</CardTitle>
              <CardDescription>{selectedRepo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <RepoFileExplorer repository={selectedRepo} />
            </CardContent>
          </Card>
        </div>
      ) : (
        repositories.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <Card key={repo.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{repo.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {repo.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    Owner: <span className="font-medium">{repo.owner.login}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Language: <span className="font-medium">{repo.language || "Not specified"}</span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {repo.stargazers_count.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <GitFork className="w-4 h-4 mr-1" />
                      {repo.forks_count.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {repo.watchers_count.toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleSelectRepo(repo)}>
                    View Files
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}

      {!isLoading && repositories.length === 0 && searchQuery && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No repositories found matching your search.</p>
        </div>
      )}
    </div>
  )
}

