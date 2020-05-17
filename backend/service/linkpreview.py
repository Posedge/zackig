import requests
from bs4 import BeautifulSoup, Tag


class LinkPreview:
    """
    A teaser of a website, containing a title, description, and a preview image.
    The website is fetched from 'url' and the preview is generated from html.
    Uses the algorithm described here:
    https://andrejgajdos.com/how-to-create-a-link-preview/
    """

    url: str
    title: str
    description: str
    image_url: str

    def __init__(self, url, html):
        self.url = url
        soup = BeautifulSoup(html, 'html.parser')
        self.title = self._extract_title(soup)
        self.description = self._extract_description(soup)
        self.image_url = self._extract_image_url(soup)

    @staticmethod
    def fetch_from_url(url):
        if not (url.startswith('http://') or url.startswith('https://')):
            url = f'http://{url}'
        r = requests.get(url)
        if not (200 <= r.status_code < 300):
            raise Exception(f'link preview url {url} returned non-2xx status code {r.status_code}')
        return LinkPreview(url, r.text)

    def to_dict(self):
        return {
            'url': self.url,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url
        }

    def _extract_title(self, soup: BeautifulSoup):
        og_title = soup.find('meta', {'property': 'og:title'})
        twitter_title = soup.find('meta', {'name: ': 'twitter:title'})
        h1 = soup.h1
        h2 = soup.h2

        if og_title is not None:
            return og_title['content']
        elif twitter_title is not None:
            return twitter_title['content']
        elif h1 is not None:
            return ' '.join(h1.stripped_strings)
        elif h2 is not None:
            return ' '.join(h2.stripped_strings)
        else:
            return None

    def _extract_description(self, soup: BeautifulSoup):
        og_desc = soup.find('meta', {'property': 'og:description'})
        twitter_desc = soup.find('meta', {'name: ': 'twitter:description'})
        meta_desc = soup.find('meta', {'name: ': 'description'})

        def non_empty_paragraph(p):
            return p.name == 'p' and len(p.contents) > 0
        first_paragraph = soup.find(non_empty_paragraph)

        if og_desc is not None:
            return og_desc['content']
        elif twitter_desc is not None:
            return twitter_desc['content']
        elif meta_desc is not None:
            return meta_desc['content']
        elif first_paragraph is not None:
            return ' '.join(first_paragraph.stripped_strings)
        else:
            return None

    def _extract_image_url(self, soup: BeautifulSoup):
        og_image = soup.find('meta', {'property': 'og:image'})
        link_image = soup.find('link', {'rel': 'image_src'})
        twitter_image = soup.find('meta', {'name: ': 'twitter:image'})

        if og_image is not None:
            return og_image['content']
        elif link_image is not None:
            return link_image['href']
        elif twitter_image is not None:
            return twitter_image['content']

        imgs = [img for img in soup.find_all('img') if self._keep_image(img)]
        if len(imgs) > 0:
            return self._absolute_url(imgs[0].src)
        return None

    def _keep_image(self, img: Tag):
        if img.width is None or img.height is None:
            return False
        if img.width > img.height:
            if img.width / img.height > 3:
                return False
        else:
            if img.height / img.width > 3:
                return False
        if img.height <= 50 or img.width <= 50:
            return False
        return True

    def _absolute_url(self, relative_url):
        """
        Transform a relative url on the website to an absolute on,
        e.g. /img/img1.jpg -> example.com/img/img1.jpg
        """
        if not relative_url.startswith('/'):
            return relative_url
        origin = self.url.split('/', 1)[0]
        return f'{origin}{relative_url}'
