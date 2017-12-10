defmodule Linklet.LinkTest do
  use Linklet.ModelCase

  alias Linklet.Link

  test "counts comments for a link" do
    Repo.insert(%Link{title: "A really great link", url: "http://example.com"})

    result = Link
    |> Link.count_comments
    |> Repo.all

    links = Enum.map(result, &attach_count/1)
    assert List.first(links).comments_count == 0
  end

  def attach_count({link, count}) do
    Map.put(link, :comments_count, count)
  end
end
