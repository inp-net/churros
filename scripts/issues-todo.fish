set doc 'gql ENDPOINT QUERY [ARGS...]
Use @file as the QUERY to use a query from a file.'

function gql --description $doc
	for arg in $argv
		if test "$arg" = "--help" -o "$arg" = "-h"
			echo $doc
			return
		end
	end
    https -p bB --ignore-stdin -F --json "$argv[1]" query="$argv[2]" $argv[3..-1]
end

set gitlabuser (GL_HOST=git.inpt.fr glab auth status 2>&1 | rg 'Logged in to' | sd '^.*Logged in to .* as (\S+).*$' '$1')


gql git.inpt.fr/api/graphql 'query ChurrosTodo($me: String!) {
    project(fullPath: "churros/churros") {
      issues(assigneeUsernames: [$me], state: opened) {
        pageInfo{
          hasNextPage
        }
        nodes {
          title
          iid
          c: mergeRequestsCount
          webUrl
          labels { nodes { title } }
        }
      }
    }
  }' variables[me]=$gitlabuser  | jq '
    def colors:
     {
     "black": "\\u001b[30m",
     "red": "\\u001b[31m",
     "green": "\\u001b[32m",
     "yellow": "\\u001b[33m",
     "blue": "\\u001b[34m",
     "magenta": "\\u001b[35m",
     "cyan": "\\u001b[36m",
     "white": "\\u001b[37m",
     "reset": "\\u001b[0m",
    };
  
    def labels: [.labels.nodes | .[] | "~\(.title)"] | join(" ");

	"\(colors.green)Issues without MRs assigned to you on churros/churros\(colors.reset)\n\n\([
		.data.project.issues.nodes | .[] | select(.c == 0) 
  		| "\(colors.cyan)#\(.iid) \(colors.reset)\(.title) \n\(colors.yellow)\(labels) \n\(colors.blue)\(.webUrl)\n"
		] | join("\n"))"' -r
