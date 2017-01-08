import test from 'ava';
import escapeRegexp from 'lodash.escaperegexp';
import AtomFeed from '../dist/atom-feed';

let dir = null;

const mock = {
  config: {
    id: 'urn:uuid:b3af7780-d5a5-11e6-bf38-dfb9af9b5ac6',
    title: 'blog',
    description: 'description',
    url: 'http://example.com/base',
    author: 'nju33'
  },
  mainDirectory: {
    posts: [
      {
        data: {
          id: 'id',
          title: 'title',
          description: 'description',
          link: 'link',
          date: 'date',
          updated: new Date()
        }
      }
    ]
  },
  createDirectory(name, renders) {
    dir = {
      name, renders, posts: [],
      createPost({slug, contents}) {
        this.posts.push({slug, contents});
      }
    };
    return dir;
  }
};

test('create', t => {
  const atomFeed = new AtomFeed();
  atomFeed.process(mock);

  const post = dir.posts[0];
  t.is(post.slug, 'feed');
  t.regex(post.contents, r`<?xml version="1.0" encoding="UTF-8"?`);
  t.regex(post.contents, r`<feed`);
  t.regex(post.contents, r`<id`);
  t.regex(post.contents, r`<link`);
  t.regex(post.contents, r`<author`);
  t.regex(post.contents, r`<name`);
  t.regex(post.contents, r`<entry`);
  t.regex(post.contents, r`<title`);
  t.regex(post.contents, r`<updated`);
});

function r([str]) {
  return new RegExp(escapeRegexp(str));
}
