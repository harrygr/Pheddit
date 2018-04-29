defmodule Linklet.Comment do
  use Linklet.Web, :model

  @timestamps_opts [usec: false]

  schema "comments" do
    field :body

    belongs_to :comment, Linklet.Comment
    belongs_to :user, Linklet.User
    belongs_to :link, Linklet.Link

    timestamps()
  end

  def changeset(model, params \\ %{}) do
    model
    |> cast(params, [:body, :link_id])
    |> validate_required([:body, :link_id])
  end

  def for_link(query, link_id) do
    query
    |> where([c], c.link_id == ^link_id)
  end

  def ordered(query) do
    query
    |> order_by([c], [desc: c.inserted_at])
  end
end
