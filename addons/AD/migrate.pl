#!/usr/bin/perl

use lib '/usr/local/pf/lib';

BEGIN {
  use Log::Log4perl;
  use pf::log();
  my $log_conf = q(
  log4perl.rootLogger              = INFO, SCREEN
  log4perl.appender.SCREEN         = Log::Log4perl::Appender::Screen
  log4perl.appender.SCREEN.stderr  = 0
  log4perl.appender.SCREEN.layout  = Log::Log4perl::Layout::PatternLayout
  log4perl.appender.SCREEN.layout.ConversionPattern = %m %n
  );
  Log::Log4perl::init(\$log_conf);
}

use pf::util;
use pf::domain;
use pf::ConfigStore::Domain;

my $REALM = pf_run('grep default_realm /etc/krb5.conf | awk \'{print $3}\'');
chomp($REALM);
my $WORKGROUP = pf_run('grep workgroup /etc/samba/smb.conf | awk \'{print $3}\'');
chomp($WORKGROUP);
my $SERVER = pf_run('grep admin_server /etc/krb5.conf | head -1 | awk \'{print $3}\'');
chomp($SERVER);
my $NAMESERVER = pf_run('grep nameserver /etc/resolv.conf | head -1 | awk \'{print $2}\'');
chomp($NAMESERVER);

print "CAUTION: The following information will end up in clear text in the PacketFence configuration files. We suggest you create another account to bind this server. This account needs to have the rights to bind a new server on the domain. \n";
print "What is the username to bind this server on the domain : ";
my $user =  <STDIN>; 
chomp ($user);

print "Password: ";
my $password =  <STDIN>; 
chomp ($password);

print "What is this server's name in your Active Directory ? ";
my $server_name = <STDIN>;
chomp($server_name);

my $cs = pf::ConfigStore::Domain->new;
$cs->update_or_create($WORKGROUP, {workgroup => $WORKGROUP, dns_name => $REALM, dns_server => $NAMESERVER, ad_server => $SERVER, bind_dn => $user, bind_pass => $password, server_name => $server_name});
$cs->commit();

print "Configuring realm : '$REALM' \n";
print "Configuring workgroup : '$WORKGROUP' \n";
print "Configuring with AD server : '$SERVER' \n";
print "Configuring with nameserver : '$NAMESERVER' \n";
print "Configuring with user : '$user' \n";
print "Configuring with password : '$password' \n";
print "Configuring with server name : '$server_name' \n";

print "Are these settings fine ? This is your last chance before the domain bind. (y/n)";
my $confirm = <STDIN>;
chomp($confirm);
if($confirm eq 'y'){
  pf::domain::regenerate_configuration();
  my $output = pf::domain::join_domain($WORKGROUP);
}
else{
  print "Please re-run the script again or configure the domain directly through the admin UI in 'Configuration->Domain'\n";
}


