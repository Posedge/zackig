from pathlib import Path

from service.linkpreview import LinkPreview


def test_get_og_tags():
    html = Path('tests/linkpreview/sample_website.html').read_text()
    preview = LinkPreview('https://andrejgajdos.com/how-to-create-a-link-preview/', html)
    print(preview.to_dict())

    assert preview.title == 'How to Create a Link Preview: The Definite Guide ' \
                            '[Implementation and Demo Included] | Andrej Gajdos'
    assert preview.description == 'The whole strategy of creating link previews, ' \
                                  'including implementation using open-source libraries in node.js. ' \
                                  'The whole solution is released as npm package.'
    assert preview.image_url == 'https://andrejgajdos.com/wp-content/uploads/2019/11/generating-link-preview-1024x562.png'


def test_no_standard_tags():
    html = Path('tests/linkpreview/sample_website_no_meta.html').read_text()
    preview = LinkPreview('https://andrejgajdos.com/how-to-create-a-link-preview/', html)
    print(preview.to_dict())

    assert preview.title == 'How to Create a Link Preview: The Definite Guide ' \
                            '[Implementation and Demo Included]'
    # just the first <p/> in the absence of better data
    assert preview.description == 'Home » Blog » How to Create a Link Preview: The Definite Guide ' \
                                  '[Implementation and Demo Included]'
