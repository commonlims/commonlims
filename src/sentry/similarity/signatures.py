

import mmh3


class MinHashSignatureBuilder(object):
    def __init__(self, columns, rows):
        self.columns = columns
        self.rows = rows

    def __call__(self, features):
        return list(map(
            lambda column: min(
                list(map(
                    lambda feature: mmh3.hash(
                        feature,
                        column,
                    ) % self.rows,
                    features,
                )),
            ),
            list(range(self.columns)),
        ))
