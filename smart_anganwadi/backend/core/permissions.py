from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsWorkerRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['worker', 'admin']
        )
class IsTeacherRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['teacher', 'admin']
        )

class IsParentRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'parent'
        )


class RoleBasedAccessPermission(permissions.BasePermission):
    """
    Allow read-only for parents if accessing their child's info.
    Workers can write their domain models.
    Admins have full access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'admin' or request.user.is_superuser:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        # For mutating methods, parents generally cannot mutate clinical or attendance records
        if request.user.role == 'parent':
            return False
        return True
