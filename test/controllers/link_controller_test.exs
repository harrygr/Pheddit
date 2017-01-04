defmodule Pheddit.LinkControllerTest do
  use Pheddit.ConnCase

  alias Pheddit.LinkView

  def get_authenticated_conn() do
    user = insert(:user)

    {:ok, jwt, _full_claims} = Guardian.encode_and_sign(user)

    build_conn()
    |> put_req_header("authorization", "Bearer #{jwt}")
  end

  test "#index shows a list of links" do
    conn = get_authenticated_conn()
    link = insert(:link)

    conn = get conn, link_path(conn, :index)

    assert json_response(conn, 200) == render_json(LinkView, "index.json", links: [link])
  end

  test "#index authenticates before showing a list of links" do
    conn = build_conn()

    response = get conn, link_path(conn, :index)
    assert response.status == 401
  end

  test "#show renders a single link" do
    conn = get_authenticated_conn()
    link = insert(:link)

    conn = get conn, link_path(conn, :show, link)

    assert json_response(conn, 200) == render_json(LinkView, "show.json", link: link)
  end

  test "#gives 404 for a non existant link" do
    conn = get_authenticated_conn()
    response = get conn, link_path(conn, :show, -1)

    assert response.status == 404
  end

  test "#create adds a new link" do
    link = %{title: "A wonderfull link", url: "http://reddit.com"}

    conn = post get_authenticated_conn(), "/api/links", link

    response = json_response(conn, :created) |> Poison.encode! |> Poison.decode!

    %{"title" => returned_title, "url" => returned_url} = response

    assert link == %{title: returned_title, url: returned_url}
  end

  test "#create validates an invalid link" do
    link = %{title: "", url: ""}

    response = post get_authenticated_conn(), "/api/links", link

    assert response.status == 422
  end

end
