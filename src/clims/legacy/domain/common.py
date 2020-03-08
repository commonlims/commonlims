
from __builtin__ import isinstance
import copy
import six


class DomainObjectMixin(object):

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self._eq_rec(self, other)
        else:
            return False

    def _eq_rec(self, a, b, cache=[]):
        """
        Replaces the == operator because of circulating references (e.g. analyte <-> well)
        Adapted solution taken from
        http://stackoverflow.com/questions/31415844/using-the-operator-on-circularly-defined-dictionaries
        """
        cache = cache + [a, b]
        if isinstance(a, DomainObjectMixin):
            a = a.__dict__
        if isinstance(b, DomainObjectMixin):
            b = b.__dict__
        if not isinstance(a, dict) or not isinstance(b, dict):
            return a == b

        set_keys = set(a.keys())
        if set_keys != set(b.keys()):
            return False

        for key in set_keys:
            if any(a[key] is i for i in cache):
                continue
            elif any(b[key] is i for i in cache):
                continue
            elif a[key].__class__.__name__ == "MagicMock" and a[key].__class__.__name__ == "MagicMock":
                # TODO: Move this to the tests. The domain objects shouldn't have to directly know about this
                # filter out mocked fields
                continue
            elif not self._eq_rec(a[key], b[key], cache):
                return False
        return True

    def __ne__(self, other):
        return not self.__eq__(other)

    def differing_fields(self, other):
        if isinstance(other, self.__class__):
            ret = []
            for key in self.__dict__:
                if self.__dict__.get(key, None) != other.__dict__.get(key, None):
                    ret.append(key)
            return ret
        else:
            return None


class AssignLogger(DomainObjectMixin):
    def __init__(self, domain_object_mixin):
        self.log = []
        self.domain_object_mixin = domain_object_mixin

    def register_assign(self, field_name, value):
        class_name = self.domain_object_mixin.__class__.__name__
        lims_id = self.domain_object_mixin.id
        self.log.append((class_name, lims_id, field_name, six.text_type(value)))
        return value

    def consume(self):
        log_output = copy.copy(self.log)
        self.log = []
        return log_output


class ConfigurationException(Exception):
    """An exception occurred that has to do with the configuration of the LIMS system"""
    pass
