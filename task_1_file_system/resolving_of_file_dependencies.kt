import java.io.File

class FileDependency(
    val dependencies: HashSet<File>,
    val content: String
)

fun readFile(path: String): String {
    return try {
        File(path).readText()
    } catch (e: Exception) {
        throw RuntimeException("Error reading file $path: ${e.message}")
    }
}

fun findDependencies(content: String): HashSet<File> {
    val dependencies = HashSet<File>()
    val lines = content.split("\n")
    for (line in lines) {
        if (line.contains("require '")) {
            val start = line.indexOf("require '") + 9
            val end = line.lastIndexOf("'")
            val dependencyPath = line.substring(start, end)
            dependencies.add(File(dependencyPath))
        }
    }
    return dependencies
}

fun buildDependencyGraph(rootPath: File): HashMap<File, FileDependency> {
    val dependencyGraph = HashMap<File, FileDependency>()

    fun traverseDirectory(currentPath: File) {
        try {
            if (currentPath.isFile) {
                val content = readFile(currentPath.absolutePath)
                val dependencies = findDependencies(content)
                val fileDependency = FileDependency(dependencies, content)
                dependencyGraph[currentPath] = fileDependency
            } else if (currentPath.isDirectory) {
                currentPath.listFiles()?.forEach {
                    traverseDirectory(it)
                }
            }
        } catch (e: Exception) {
            throw RuntimeException("Error processing file ${currentPath.absolutePath}: ${e.message}")
        }
    }

    try {
        traverseDirectory(rootPath)
    } catch (e: Exception) {
        throw RuntimeException("Error traversing directory ${rootPath.absolutePath}: ${e.message}")
    }

    return dependencyGraph
}

fun topologicalSort(dependencyGraph: HashMap<File, FileDependency>): List<File> {
    val visited = HashSet<File>()
    val result = mutableListOf<File>()
    val stack = mutableListOf<File>()

    fun dfs(file: File) {
        if (stack.contains(file)) {
            val cycleStartIndex = stack.indexOf(file)
            val cycle = stack.subList(cycleStartIndex, stack.size)
            val cycleFiles = cycle.joinToString(" -> ") { it.name }
            val errorMessage = "Cyclic dependency found involving files: $cycleFiles"
            File("dependency_graph.txt").appendText("$errorMessage\n")
            throw IllegalArgumentException(errorMessage)
        }

        if (!visited.contains(file)) {
            visited.add(file)
            stack.add(file)

            for (dep in dependencyGraph[file]?.dependencies ?: emptySet()) {
                dfs(dep)
            }

            stack.removeAt(stack.size - 1)
            result.add(file)
        }
    }

    for (file in dependencyGraph.keys.sorted()) {
        if (!visited.contains(file)) {
            dfs(file)
        }
    }

    return result.sorted()
}

fun concatenateFiles(sortedFiles: List<File>, dependencyGraph: HashMap<File, FileDependency>, rootPath: File) {
    val outputFile = File("output.txt")
    val writer = try {
        outputFile.bufferedWriter()
    } catch (e: Exception) {
        throw RuntimeException("Error creating output file: ${e.message}")
    }

    for (file in sortedFiles) {
        val fileDependency = dependencyGraph[file]
        try {
            writer.write(fileDependency?.content ?: "")
            writer.write("\n\n")
        } catch (e: Exception) {
            throw RuntimeException("Error writing to output file: ${e.message}")
        }
    }

    try {
        writer.close()
    } catch (e: Exception) {
        throw RuntimeException("Error closing output file: ${e.message}")
    }
}

fun createDependencyGraph(rootPath: File, dependencyGraph: HashMap<File, FileDependency>) {
    val graphFile = File("dependency_graph.txt")

    fun traverseDirectory(currentPath: File, stack: MutableList<File>) {
        if (stack.contains(currentPath)) {
            val cycleStartIndex = stack.indexOf(currentPath)
            val cycle = stack.subList(cycleStartIndex, stack.size)
            val cycleFiles = cycle.joinToString(" -> ") { it.name }
            graphFile.appendText("Cyclic dependency found involving files: $cycleFiles\n")
            return
        }

        if (currentPath.isFile) {
            if (dependencyGraph.containsKey(currentPath)) {
                graphFile.appendText("${currentPath.name}\n")
                val dependencies = dependencyGraph[currentPath]?.dependencies ?: emptySet()
                dependencies.forEach { dependency ->
                    graphFile.appendText("  Requires: ${dependency.name}\n")
                }
            }
        } else if (currentPath.isDirectory) {
            stack.add(currentPath)
            currentPath.listFiles()?.forEach { innerFile ->
                traverseDirectory(innerFile, stack.toMutableList())
            }
            stack.removeAt(stack.size - 1)
        }
    }

    traverseDirectory(rootPath, mutableListOf())
}

fun main() {
    val rootPath = File("root_directory")

    try {
        val dependencyGraph = buildDependencyGraph(rootPath)
        try {
            val sortedFiles = topologicalSort(dependencyGraph)
            concatenateFiles(sortedFiles, dependencyGraph, rootPath)
            createDependencyGraph(rootPath, dependencyGraph) // Call to create dependency graph file
        } catch (e: IllegalArgumentException) {
            println("Error: ${e.message}")
        }
    } catch (e: Exception) {
        println("Error: ${e.message}")
    }
}

