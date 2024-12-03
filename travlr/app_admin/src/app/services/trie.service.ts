import { Injectable } from "@angular/core";

// app_admin/src/app/services/trie.service.ts
export class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord = false;
  suggestions: string[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class TrieService {
  private root = new TrieNode();

  insert(word: string) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
      if (node.suggestions.length < 5) {
        node.suggestions.push(word);
      }
    }
    node.isEndOfWord = true;
  }

  search(prefix: string): string[] {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }
    return node.suggestions;
  }
}
