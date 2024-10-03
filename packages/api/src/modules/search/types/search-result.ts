import { builder } from '#lib';
import { DocumentSearchResultType } from '#modules/documents';
import { EventSearchResultType } from '#modules/events';
import { GroupSearchResultType } from '#modules/groups';
import { ArticleSearchResultType } from '#modules/posts';
import { UserSearchResultType } from '#modules/users';

export const SearchResultType = builder.unionType('SearchResult', {
  types: [
    UserSearchResultType,
    GroupSearchResultType,
    EventSearchResultType,
    ArticleSearchResultType,
    DocumentSearchResultType,
  ],
  resolveType(value) {
    if ('user' in value) return 'UserSearchResult';
    if ('group' in value) return 'GroupSearchResult';
    if ('event' in value) return 'EventSearchResult';
    if ('article' in value) return 'ArticleSearchResult';
    if ('document' in value) return 'DocumentSearchResult';
    throw new Error('Invalid search result');
  },
});
