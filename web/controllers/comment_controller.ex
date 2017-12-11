defmodule Linklet.CommentController do
  use Linklet.Web, :controller

  plug Guardian.Plug.EnsureAuthenticated, [handler: Linklet.SessionController] when action in [:create, :delete]

  alias Linklet.Comment

  def index(conn, %{"link_id" => link_id}) do
    comments = Comment
    |> Comment.for_link(link_id)
    |> Comment.ordered
    |> Repo.all
    |> Repo.preload([:user])

    render conn, "index.json", comments: comments
  end

  def create(conn, params) do
    changeset = Guardian.Plug.current_resource(conn)
    |> build_assoc(:comments)
    |> Comment.changeset(params)

    case Repo.insert(changeset) do
      {:ok, comment} ->
        conn
        |> put_status(:created)
        |> render("show.json", comment: Repo.preload(comment, [:user]))
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(Linklet.ChangesetView, "error.json", changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Guardian.Plug.current_resource(conn)
    comment = Repo.get!(Comment, id)

    if user == nil or comment.user_id != user.id do
      conn |> put_status(:forbidden) |> text("unauthorized")
    else
      comment |> Repo.delete!()
      conn |> text("comment deleted")
    end
  end
end
