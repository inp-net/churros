#!/usr/bin/env fish
set doc 'gql ENDPOINT QUERY [TOKEN]
Use @file as the QUERY to use a query from a file.'

function gql --description $doc
	for arg in $argv
		if test "$arg" = "--help" -o "$arg" = "-h"
			echo $doc
			return
		end
	end
	set header ""
	if test (count $argv) = 3
		https --ignore-stdin -F --json "$argv[1]" query="$argv[2]" Authorization:"Bearer $argv[3]" | jq .data
	else
		https --ignore-stdin -F --json "$argv[1]" query="$argv[2]" | jq .data
	end
end
gql churros.inpt.fr/graphql @introspection.graphql | jq .__schema > ../src/lib/schema.json && quicktype -l typescript ../src/lib/schema.json > ../src/lib/schema.ts

