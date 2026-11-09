import { submitFeedback } from '@/lib/actions';

export type FeedbackQuestion = { id: string; project_id: string; prompt: string; kind: string; required: boolean; sort_order: number };

export function FeedbackForm({ projectId, questions }: { projectId: string; questions: FeedbackQuestion[] }) {
  return <form action={submitFeedback} className="form-grid">
    <input type="hidden" name="project_id" value={projectId}/>
    <label>Overall experience<select name="overall_rating" required defaultValue=""><option value="" disabled>Select rating</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>
    <label>Usability<select name="usability_rating" required defaultValue=""><option value="" disabled>Select rating</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>
    {questions.map(question => <label className="wide" key={question.id}>{question.prompt}{question.required ? ' *' : ''}
      {question.kind === 'text' ? <textarea name={`answer_${question.id}`} maxLength={3000} required={question.required} placeholder="Your answer"/> :
      <select name={`answer_${question.id}`} required={question.required} defaultValue=""><option value="">Select an answer</option>{question.kind === 'rating' ? [1,2,3,4,5].map(n=><option key={n} value={n}>{n} / 5</option>) : <><option value="yes">Yes</option><option value="no">No</option></>}</select>}
    </label>)}
    <label className="wide">Bugs and technical issues<textarea name="bugs" placeholder="What did you encounter?"/></label>
    <label className="wide">Feature requests<textarea name="feature_requests" placeholder="What would improve the product?"/></label>
    <label className="wide">General comments<textarea name="comments" placeholder="What else should the maker know?"/></label>
    <button className="button">Submit feedback</button>
  </form>;
}
