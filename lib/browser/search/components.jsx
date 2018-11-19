const React = require('react');
const { SHOW_SEARCH_RESULTS, HIDE_SEARCH_RESULTS } = require('./actions');
const { dispatch } = require('../utils');

class SearchForm extends React.Component {

  constructor(props) {
    super(props);
  }

  handleKeyUp(e) {

    const query = (e.target.value || '').trim();
    //console.log('query:' + query);
    if (!query) {
      dispatch(HIDE_SEARCH_RESULTS);
      return;
    }

    const results = this.props.search(query);
    //console.log(results);
    if (results.length > 0) {
      //console.log('enter');
      dispatch(SHOW_SEARCH_RESULTS, { results, query });
    }
    else {
      fetch('/lunr.json', { credentials: 'include' })
        .then(function(res) {
          return res.json();
        })
        .then(function(json) {
          //console.log('**store**');
          //console.log(json.store);
          for (var key in json.store) {
            if (json.store.hasOwnProperty(key)) {
              //console.log(key + " -> " + json.store[key]); //body path title
              //console.log(json.store[key].body.includes(query));
              if (json.store[key].body.includes(query)) {
                var displayContent = {
                  body: generateBody(json.store[key].body, query),
                  path: json.store[key].path,
                  title: json.store[key].title
                };
                results.push(displayContent);
              }
              else if (json.store[key].title.includes(query)) {
                var displayContent = {
                  body: generateBody(json.store[key].body, query),
                  path: json.store[key].path,
                  title: json.store[key].title
                };
                results.push(displayContent);
              }
            }
          }
          dispatch(SHOW_SEARCH_RESULTS, { results, query });

        });

    }



    if (typeof this.props.onSearch === 'function') {
      this.props.onSearch();
    }



  }

  render() {

    if (!this.props.search) { return null; }

    return (
      <div className="dc-search-form doc-search-form">
        <input type="search"
          className="dc-input dc-search-form__input doc-search-form__input"
          placeholder="Search..."
          onKeyUp={this.handleKeyUp.bind(this)}
          autoFocus={this.props.autoFocus} />
        <button className="dc-btn dc-search-form__btn doc-search-form__btn" aria-label="Search">
          <i className="dc-icon dc-icon--search"></i>
        </button>
      </div>
    );
  }
}


function generateBody(body, query) {
  var indexNumber = body.indexOf(query);
  var bodyLength = body.length;
  var returnBody = '';
  var frontCut = 10;
  var bodyCut = 100;

  if (indexNumber < frontCut && bodyLength > bodyCut) {
    returnBody = body.substring(0, bodyCut) + '。。。';
  }
  else if (indexNumber < frontCut && bodyLength < bodyCut) {
    returnBody = body.substring(0, bodyLength);
  }
  else if (indexNumber > frontCut && bodyLength > (bodyCut + indexNumber)) {
    returnBody = '。。。' + body.substring(indexNumber, bodyCut + indexNumber) + '。。。';
  }
  else if (indexNumber > frontCut && bodyLength < (bodyCut + indexNumber)) {
    returnBody = '。。。' + body.substring(indexNumber, bodyLength);
  }
  console.log(returnBody);
  return returnBody;
}



function SearchResultsTitle({ results, query }) {
  return (
    <div>
      <h1 className="doc-search-results__title">
        { results.length ? results.length : 'No' } results for <span className="doc-search-results__title__query">"{query}"</span>
      </h1>

      { !results.length ? <p>There are no results for "{query}". Why not <strong>try typing another keyword?</strong></p> : null }
    </div>
  );
}

function SearchResultsList({ results }) {
  if (!results.length) {
    return null;
  }

  const handleSearchResultLinkClick = () => dispatch(HIDE_SEARCH_RESULTS);

  const createMarkup = (html) => ({ __html: html });

  return (
    <ul className="doc-search-results__list">
      { results.map((result, i) => {
        return (
          <li key={'doc-search-results__list__item-' + i } className="doc-search-results__list__item">
            <a
              href={result.path}
              className="doc-search-results__list__link"
              onClick={handleSearchResultLinkClick}>
              {result.title}
            </a>
            <p dangerouslySetInnerHTML={createMarkup(result.body)}></p>
          </li>
        );
      })}
    </ul>
  );
}

module.exports = { SearchForm, SearchResultsTitle, SearchResultsList };
