// Text Chunking Service for Medical Book
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

class ChunkingService {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 500
    this.chunkOverlap = options.chunkOverlap || 50
  }

  

  // Process medical book content
  async processMedicalBook(bookContent, metadata = {}) {
    const sections = bookContent.split(/\n\n\n+|\n===+|\n---+|\n#+\s+/)
    const allChunks = []

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
    })

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim()
      if (!section || section.length < 50) continue

      const sectionMetadata = {
        ...metadata,
        section: `section-${i}`,
        chapter: metadata.chapter || `chapter-${Math.floor(i / 10)}`,
      }

      const parts = await splitter.splitText(section)
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j]
        allChunks.push({
          chunkId: `chunk-${Date.now()}-${i}-${j}`,
          content: part.trim(),
          metadata: {
            ...sectionMetadata,
            chunkIndex: j,
            textLength: part.length,
          },
        })
      }
    }

    if (allChunks.length === 0) {
      const parts = await splitter.splitText(bookContent)
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j]
        allChunks.push({
          chunkId: `chunk-${Date.now()}-fallback-${j}`,
          content: part.trim(),
          metadata: {
            ...metadata,
            chunkIndex: j,
            textLength: part.length,
            section: metadata.section || 'all',
            chapter: metadata.chapter || 'all',
          },
        })
      }
    }

    return allChunks
  }
}

export default new ChunkingService();

