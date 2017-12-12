import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { Option } from 'space-lift'

import { State } from '../../store'
import { RouteComponentProps } from 'react-router'
import NotFound from '../404'
import { Link, Comment } from '../../api/types'

import { fetchLinksIfNeeded } from '../../store/links/thunks'
import {
  fetchComments,
  deleteComment,
  postComment,
} from '../../store/comments/thunks'
import { values } from 'lodash'
import CommentList from '../../components/comment-list'
import { getUserIdFromToken } from '../../utils/auth'
import { SubmitHandler, reduxForm, Field } from 'redux-form'

interface FormProps {
  handleSubmit: SubmitHandler<Fields, {}>
}

interface Fields {
  body: string
}

const CommentForm = reduxForm<Fields>({
  form: 'comment',
})((props: FormProps) => {
  const { handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="body">Comment</label>
        <Field name="body" component="textarea" type="text" />
      </div>
      <button type="submit">Post Comment</button>
    </form>
  )
})

interface Params {
  id: string
}

interface StateMappedToProps {
  links: Record<string, Link>
  comments: Record<string, Comment>
  loading: boolean
  userId: Option<number>
}
interface DispatchMappedToProps {
  fetchLinksIfNeeded: () => void
  fetchComments: (linkId: string) => void
  postComment: (linkId: string) => (fields: Fields) => any
  deleteComment: (linkId: string, commentId: string) => void
}

interface Props
  extends StateMappedToProps,
    DispatchMappedToProps,
    RouteComponentProps<Params> {}

export class ShowLink extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchLinksIfNeeded()
    this.props.fetchComments(this.props.match.params.id)
  }

  render() {
    if (this.props.loading) {
      return <div />
    }

    const link = this.props.links[this.props.match.params.id]
    if (!link) {
      return NotFound()
    }

    const onDeleteComment = (commentId: number) => {
      this.props.deleteComment(link.id.toString(), commentId.toString())
    }

    const onPostComment = this.props.postComment(link.id.toString())

    return (
      <div>
        <h2>
          <a href={link.url} target="_blank">
            {link.title}
          </a>
        </h2>
        <p>{link.url}</p>
        <h3>Comments</h3>

        <CommentList
          comments={values(this.props.comments)}
          onDelete={onDeleteComment}
          userId={this.props.userId}
        />

        {this.props.userId
          .map(() => <CommentForm onSubmit={onPostComment} />)
          .get()}
      </div>
    )
  }
}
function mapStateToProps({ links, ui, comments, auth }: State) {
  return {
    links: links.items,
    comments: comments.items,
    loading: ui.loading,
    userId: getUserIdFromToken(auth.token),
  }
}

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    fetchLinksIfNeeded: () => dispatch(fetchLinksIfNeeded()),
    fetchComments: (linkId: string) => dispatch(fetchComments(linkId)),
    deleteComment: (linkId: string, commentId: string) =>
      dispatch(deleteComment(linkId, commentId)),
    postComment: (linkId: string) => (fields: Fields) =>
      dispatch(postComment(linkId, fields.body)),
  }
}

export default connect<StateMappedToProps, DispatchMappedToProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ShowLink)
