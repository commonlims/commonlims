import requests


class SearchService(object):
    """
    A search service that provides a fast search that supports the Lucene syntax. Indexing
    of objects is based on the plugin definition for the object.

    Notice that searches may be behind the actual state of data in the database, as the indexing
    is done on a regular interval. If the indexing starts lagging more than 5 seconds, the user will
    be warned in the UI while doing the search

    Return values are the documents stored in Elastic and metadata about the search. Users
    must call the respective service to get the business object.
    """

    def __init__(self):
        self.base_url = "http://localhost:9200"  # TODO

        # Determines how old the index may be until we start warning users while they do the search.
        self.index_age_sec_before_warning = 5

    def search(self, index, search_query):
        # curl -X GET "localhost:9200/bank/_search?q=account_number:49%20AND%20age:23%20AND%20city:sunriver"
        url = "{}/{}/_search".format(self.base_url, index)
        params = dict(q=search_query)

        resp = requests.get(url, params=params)
        if resp.status_code != 200:
            raise SearchError("Not able to execute search (status_code={}). "
                              "Response from ElasticSearch was: {}".format(resp.status_code,
                                      resp.json()))
        return resp.json()

    def index_batch(self):
        # Indexes a batch of domain objects
        pass


class SearchError(Exception):
    pass


def main():
    service = SearchService()
    res = service.search("bank", "account_number:49")
    print(res)


if __name__ == "__main__":
    main()
