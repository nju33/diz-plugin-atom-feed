import xmlbuilder from 'xmlbuilder';
import omitBy from 'lodash.omitby';
import isNull from 'lodash.isnull';

const head = '<?xml version="1.0" encoding="UTF-8"?>';

export default class AtomFeed {
  validate(root) {
    if (typeof root.config.id !== 'string') {
      console.log(`[atom-feed] id is not found in config of ${root.name}`);
      return false;
    }

    if (typeof root.config.author !== 'string') {
      console.log(`[atom-feed] author is not found in config of ${root.name}`);
      return false;
    }

    return root.mainDirectory.posts.every(post => {
      const id = Boolean(post.data.id);
      if (!id) {
        console.log(`[atom-feed] id is not found in frontmatter of ${post.id}`);
      }

      const date = Boolean(post.data.date);
      if (!date) {
        console.log(
          `[atom-feed] date is not found in frontmatter of ${post.id}`
        );
      }

      return [id, date].every(i => i);
    });
  }

  create() {
    return xmlbuilder.begin().ele('feed', {
      xmlns: 'http://www.w3.org/2005/Atom'
    });
  }

  buildEntries(posts) {
    return posts.map(post => {
      return omitBy({
        id: post.data.id,
        title: post.data.title || null,
        link: post.absURL || null,
        summary: post.data.description || null,
        updated: post.data.date || null
      }, isNull);
    });
  }

  process(root) {
    if (!this.validate(root)) {
      return;
    }

    const xmlElem = this.create().ele({
      id: root.config.id,
      title: root.config.title,
      link: root.config.url,
      author: {
        name: root.config.author
      }
    }).up();

    this.buildEntries(root.mainDirectory.posts).forEach(entry => {
      const entryElem = xmlbuilder.begin().ele({entry});
      xmlElem.importDocument(entryElem);
    });

    const contents = `${head}\n${xmlElem.end()}`;

    const dir = root.createDirectory('', false);
    dir.createPost({slug: 'feed', contents});
  }
}
