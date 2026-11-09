import Link from 'next/link';
import { db, currentUser } from '@/lib/supabase';
import { FeedbackForm, type FeedbackQuestion } from '@/components/feedback-form';

type ProjectInfo = { name: string; instructions: string | null };
type FeedbackProject = { name: string };

export default async function Feedback({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  const [assignments, received, mine] = await Promise.all([
    client!.from('project_members').select('project_id,projects(name,instructions)').eq('tester_id',user!.id),
    client!.from('feedbacks').select('id,project_id,overall_rating,usability_rating,bugs,feature_requests,comments,answers,created_at,projects!inner(name,maker_id)').eq('projects.maker_id',user!.id).order('created_at',{ascending:false}),
    client!.from('feedbacks').select('project_id').eq('tester_id',user!.id)
  ]);
  const done = new Set((mine.data || []).map(feedback => feedback.project_id));
  const pending = (assignments.data || []).filter(assignment => !done.has(assignment.project_id));
  const projectIds = [...new Set([...pending.map(item => item.project_id), ...(received.data || []).map(item => item.project_id)])];
  const { data: questions } = projectIds.length
    ? await client!.from('feedback_questions').select('id,project_id,prompt,kind,required,sort_order').in('project_id',projectIds).order('sort_order',{ascending:true})
    : { data: [] };
  const allQuestions = (questions || []) as FeedbackQuestion[];
  const prompts = new Map(allQuestions.map(question => [question.id, question.prompt]));

  return <>
    <span className="eyebrow">Product insight</span><h1>Feedback</h1>
    <p className="sub">Share your testing experience and review responses to your products.</p>
    {message && <div className="message">{message}</div>}
    <div className="panel"><h2>Tests awaiting your feedback</h2>
      {pending.length ? pending.map(assignment => {
        const project = assignment.projects as unknown as ProjectInfo;
        return <div key={assignment.project_id} style={{borderTop:'1px solid #dce5df',paddingTop:20,marginTop:20}}>
          <h3>{project?.name || 'Project'}</h3><p style={{fontSize:13,color:'#68776d'}}>{project?.instructions || 'Explore the product and share your experience.'}</p>
          <FeedbackForm projectId={assignment.project_id} questions={allQuestions.filter(q => q.project_id === assignment.project_id)}/>
        </div>;
      }) : <div className="empty"><h3>Nothing to submit right now</h3><p>When a maker approves your application, the project will appear here.</p><Link className="button" href="/explore">Find a project</Link></div>}
    </div>
    <div className="panel"><h2>Feedback for your projects</h2>
      {received.data?.length ? <div className="table-wrap"><table><thead><tr><th>Project</th><th>Ratings</th><th>Responses</th><th>Received</th></tr></thead><tbody>
        {received.data.map(item => {
          const answers = (item.answers && typeof item.answers === 'object' && !Array.isArray(item.answers) ? item.answers : {}) as Record<string,string>;
          return <tr key={item.id}>
            <td>{(item.projects as unknown as FeedbackProject)?.name || 'Project'}</td>
            <td>{item.overall_rating}/5 overall<br/>{item.usability_rating}/5 usability</td>
            <td style={{maxWidth:520}}>
              {item.comments && <p>{item.comments}</p>}
              <p><strong>Bugs:</strong> {item.bugs || 'None reported'}<br/><strong>Ideas:</strong> {item.feature_requests || 'None shared'}</p>
              {Object.entries(answers).map(([id,answer]) => <p key={id}><strong>{prompts.get(id) || 'Custom question'}:</strong> {answer}</p>)}
            </td>
            <td>{new Date(item.created_at).toLocaleDateString()}</td>
          </tr>;
        })}
      </tbody></table></div> : <div className="empty"><h3>No feedback yet</h3><p>Responses from selected testers will appear here.</p></div>}
    </div>
  </>;
}
