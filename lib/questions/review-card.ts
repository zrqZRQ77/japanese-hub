import type { KnowledgeCard, Question } from '@/lib/types'

export interface ReviewCardLink {
  href: string
  label: string
  cardType?: KnowledgeCard['cardType']
}

function normalize(value: string) {
  return value.normalize('NFKC').replace(/[\s、。・（）()「」『』【】]/g, '')
}

export function selectReviewCard(question: Question, cards: KnowledgeCard[]): KnowledgeCard | undefined {
  return [...cards]
    .map(card => {
      let score = card.questionLink?.questionId === question.id ? 100 : 0
      for (const tag of question.tags ?? []) {
        if (card.tags?.includes(tag)) score += 12
        const key = normalize(tag)
        if (key && normalize(`${card.front}${card.back}`).includes(key)) score += 3
      }
      if (['判断', '手順', '誤り診断'].includes(card.cardType ?? '')) score += 1
      return { card, score }
    })
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))[0]?.card
}

export function createReviewCardMap(questions: Question[], cards: KnowledgeCard[]) {
  return Object.fromEntries(questions.map(question => {
    const card = selectReviewCard(question, cards)
    const href = card
      ? `/exams/${question.examId}/cards?chapter=${question.chapterId}&card=${card.id}`
      : `/exams/${question.examId}/cards?chapter=${question.chapterId}`
    const link: ReviewCardLink = {
      href,
      label: card?.front ?? 'この章の知識カード',
      cardType: card?.cardType,
    }
    return [question.id, link]
  }))
}
