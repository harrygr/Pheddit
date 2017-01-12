import {expect} from 'chai'
import urlParser from './url-parser'

describe('A test', function () {
  it('tests the truth', function () {

    const urls = {
      'http://www.youtube.com/watch?v=ClkQA2Lb_iE': 'www.youtube.com',
      'http://youtu.be/ClkQA2Lb_iE': 'youtu.be',
      'http://www.example.com/12xy45': 'www.example.com',
      'http://example.com/random': 'example.com',
      'example.com/random': 'example.com',
      'example.com:8000/random': 'example.com',
      'example.com?q=hello': 'example.com',
    }
    Object.keys(urls).forEach(url => {
      expect(urlParser(url)).to.equal(urls[url])
    })
  })
})