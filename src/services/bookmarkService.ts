import { Bookmark } from '../models/Bookmark';
import { Sentence } from '../models/Sentence';
import { Category } from '../models/Category';
import { Level } from '../models/Level';
import { Vocabulary } from '../models/Vocabulary';

export class BookmarkService {
  /**
   * Adds a sentence to user bookmarks
   */
  static async addBookmark(userId: number, sentenceId: number, note?: string) {
    const [bookmark, created] = await Bookmark.findOrCreate({
      where: { userId, sentenceId },
      defaults: { userId, sentenceId, note },
    });

    if (!created && note !== undefined) {
      bookmark.note = note;
      await bookmark.save();
    }

    return bookmark;
  }

  /**
   * Removes a bookmark
   */
  static async removeBookmark(userId: number, sentenceId: number) {
    const deletedCount = await Bookmark.destroy({
      where: { userId, sentenceId },
    });
    return deletedCount > 0;
  }

  /**
   * Gets all bookmarks for user
   */
  static async getUserBookmarks(userId: number) {
    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Sentence,
          as: 'sentence',
          include: [
            { model: Category, as: 'category' },
            { model: Level, as: 'level' },
            { model: Vocabulary, as: 'vocabularies', through: { attributes: [] } },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return bookmarks.map((b: any) => ({
      id: b.id,
      sentenceId: b.sentenceId,
      note: b.note,
      createdAt: b.createdAt,
      sentence: b.sentence,
    }));
  }
}
