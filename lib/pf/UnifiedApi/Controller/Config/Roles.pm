package pf::UnifiedApi::Controller::Config::Roles;

=head1 NAME

pf::UnifiedApi::Controller::Config::Roles - 

=cut

=head1 DESCRIPTION

pf::UnifiedApi::Controller::Config::Roles

=cut

use strict;
use warnings;
use pf::dal::node_category;
use pf::error qw(is_error);

use Mojo::Base qw(pf::UnifiedApi::Controller::Config);

has 'config_store_class' => 'pf::ConfigStore::Roles';
has 'form_class' => 'pfappserver::Form::Config::Roles';
has 'primary_key' => 'role_id';

use pf::ConfigStore::Roles;
use pfappserver::Form::Config::Roles;
use pfconfig::cached_hash;

tie our %RolesReverseLookup, 'pfconfig::cached_hash', 'resource::RolesReverseLookup';

sub can_delete {
    my ($self) = @_;
    my ($db_status, $db_msg, $db_errors) = $self->can_delete_from_db();
    if (is_error($db_status) && !defined $db_errors) {
        return ($db_status, $db_msg);
    }

    my ($config_status, $config_msg, $config_errors) = $self->can_delete_from_config();
    if (is_error($config_status) || is_error($db_status)) {
        return (422, 'Role still in use', [ @{$db_errors // []}, @{$config_errors // []} ]  );
    }

    return (200, '');
}

sub can_delete_from_config {
    my ($self) = @_;
    my $id = $self->id;
    if (exists $RolesReverseLookup{$id}) {
        my @errors = map { config_delete_error($id, $_) } sort keys %{$RolesReverseLookup{$id}};
        return (422, 'Role still in use', \@errors);
    }

    return (200, '');
}

sub config_delete_error {
    my ($name, $namespace) = @_;
    my $reason = uc($namespace) . "_IN_USE";
    return { name => $name, message => "Role still in use for $namespace", reason => $reason, status => 422 };
}

my $CAN_DELETE_FROM_DB_SQL = <<SQL;
SELECT
    x.node_category_id || x.node_bypass_role_id || x.password_category AS `still_in_use`,
    x.*
    FROM (
    SELECT
        EXISTS (SELECT 1 FROM node, node_category WHERE (node.category_id = node_category.category_id ) AND node_category.name = ? LIMIT 1) as node_category_id,
        EXISTS (SELECT 1 FROM node, node_category WHERE (node.bypass_role_id = node_category.category_id ) AND node_category.name = ? LIMIT 1) as node_bypass_role_id,
        EXISTS (SELECT 1 FROM password, node_category WHERE password.category = node_category.category_id AND node_category.name = ? LIMIT 1) as password_category
) AS x;
SQL

my %IN_USE_MESSAGE = (
    node_category_id => 'Role is still used by node(s) as a role',
    node_bypass_role_id => 'Role is still used by node(s) as a bypass role',
    password_category => 'Role is still used by user(s)',
);

sub db_delete_error {
    my ($name, $namespace) = @_;
    my $reason = uc($namespace) . "_IN_USE";
    return { message => $IN_USE_MESSAGE{$namespace} // "Role still in use", name => $name, reason => $reason, status => 422 };
}

sub can_delete_from_db {
    my ($self) = @_;
    my $id = $self->id;
    my ($status, $sth) = pf::dal::node_category->db_execute($CAN_DELETE_FROM_DB_SQL, $id, $id, $id);
    if (is_error($status)) {
        return ($status, "Unable to check role in the database");
    }

    my $role_data = $sth->fetchrow_hashref;
    $sth->finish;
    my @errors;
    if ($role_data->{still_in_use}) {
        delete $role_data->{still_in_use};
        for my $key (sort keys %$role_data) {
            if ($role_data->{$key}) {
                push @errors, db_delete_error($id, $key);
            }
        }

        return (422, "Role still in use", \@errors);
    }

    return (200, '');
}

sub reassign {
    my ($self) = @_;
    my ($error, $data) = $self->get_json;
    if (defined $error) {
        return $self->render_error(400, "Bad Request : $error");
    }

    my @errors;
    my $old = $data->{old};
    my $new = $data->{new};
    $self->check_reassign_args($old, $new, \@errors);
    if (@errors) {
        return $self->render_error(422, "Unable to reassign role", \@errors);
    }

    return $self->render_error(422, "Unable to reassign role");
}

sub check_reassign_args {
    my ($self, $old, $new, $errors) = @_;
    if (!defined $old) {
        push @$errors, { field => "old", message => "'old' field is missing"};
    }

    if (!defined $new) {
        push @$errors, { field => "new", message => "'new' field is missing"};
    }

    my $cs = $self->config_store;
    if (defined $old && !$cs->hasId($old)) {
        push @$errors, { field => "old", message => "'$old' field is invalid"};
    }

    if (defined $new && !$cs->hasId($new)) {
        push @$errors, { field => "new", message => "'$new' field is invalid"};
    }

}
 
=head1 AUTHOR

Inverse inc. <info@inverse.ca>

=head1 COPYRIGHT

Copyright (C) 2005-2020 Inverse inc.

=head1 LICENSE

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
USA.

=cut

1;

