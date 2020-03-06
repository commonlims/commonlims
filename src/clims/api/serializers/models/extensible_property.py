


from rest_framework import serializers


class ExtensiblePropertySerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    version = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    display_name = serializers.CharField(read_only=True)
    value = serializers.SerializerMethodField(method_name="get_value_with_correct_type")

    def get_value_with_correct_type(self, obj):
        return obj.value
