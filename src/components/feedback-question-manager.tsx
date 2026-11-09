import { createFeedbackQuestion, deleteFeedbackQuestion } from '@/lib/actions';
import { ConfirmButton } from './confirm-button';

type Question = { id: string; prompt: string; kind: string; required: boolean; sort_order: number };

export function FeedbackQuestionManager({ projectId, questions, editable }: { projectId: string; questions: Question[]; editable: boolean }) {
  return <div className="panel">
    <h2>Custom feedback questions</h2>
    <p style={{fontSize:12,color:'#68776d'}}>Add focused questions alongside the standard ratings, bugs, and comments.</p>
    {questions.length ? <div className="table-wrap"><table><thead><tr><th>Question</th><th>Type</th><th>Required</th><th></th></tr></thead><tbody>
      {questions.map(q => <tr key={q.id}><td>{q.prompt}</td><td>{q.kind.replace('_',' ')}</td><td>{q.required ? 'Yes' : 'No'}</td><td>{editable && <form action={deleteFeedbackQuestion}><input type="hidden" name="project_id" value={projectId}/><input type="hidden" name="id" value={q.id}/><ConfirmButton className="button small light" message="Remove this feedback question?">Remove</ConfirmButton></form>}</td></tr>)}
    </tbody></table></div> : <div className="empty"><h3>No custom questions</h3><p>The standard feedback form is ready to use.</p></div>}
    {editable && <form action={createFeedbackQuestion} className="form-grid" style={{marginTop:22}}>
      <input type="hidden" name="project_id" value={projectId}/>
      <label className="wide">Question<input className="field" name="prompt" minLength={5} maxLength={300} required placeholder="What would you improve first?"/></label>
      <label>Answer type<select name="kind"><option value="text">Long text</option><option value="rating">Rating (1–5)</option><option value="yes_no">Yes / No</option></select></label>
      <label style={{display:'flex',alignItems:'center',gap:9,alignSelf:'end',minHeight:44}}><input type="checkbox" name="required"/>Required answer</label>
      <button className="button">Add question</button>
    </form>}
  </div>;
}
