# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

from flask import Blueprint, Response, g
import datetime
# import xlrd.xldate
import xlrd
import random
import jinja2


# imports bc copied blueprint functions #
from clint.textui import colored
import p2p
from tarbell.utils import puts
from tarbell.oauth import get_drive_api
from tarbell.hooks import register_hook


from collections import OrderedDict
from jinja2 import Markup
from jinja2.exceptions import TemplateNotFound
import re, codecs, archieml

from pprint import pprint
from apiclient import errors
# from flask import Blueprint, Response, g

from subprocess import call

##########################
# imports from blueprint #
##########################

# from blueprint import MissingP2PContentItemFieldError
# class MissingP2PContentItemFieldError(KeyError):
#     """Exception for when a P2P content item doesn't have the required fields"""

#     def __init__(self, field_name):
#         msg = "P2P content item is missing field {0}".format(field_name)
#         super(MissingP2PContentItemFieldError, self).__init__(msg)
#         self.field_name = field_name

# # from blueprint import p2p_publish_htmlstory
# def p2p_publish_htmlstory(htmlstory, site, s3):
#     content = render_p2p_content_item(htmlstory, site)

#     content_item = {
#         'content_item_type_code': 'htmlstory',
#         'body': content,
#         'custom_param_data': {},
#     }

#     # TODO: The logic for renaming and transforming fields from the
#     # spreadsheet to the content item data sent in the API request
#     # could be refactored into a separate function and standardized
#     # between the blurb and htmlstory publishing functions.
#     required_fields = (
#         ('p2p_slug', 'slug'),
#         ('title', 'title'),
#         ('byline', 'byline'),
#         ('seotitle', 'seotitle'),
#         ('seodescription', 'seodescription'),
#         ('keywords', 'seo_keyphrase'),
#     )
#     for spreadsheet_field_name, content_item_field_name in required_fields:
#         try:
#             content_item[content_item_field_name] = htmlstory[spreadsheet_field_name]
#         except KeyError:
#             raise MissingP2PContentItemFieldError(spreadsheet_field_name)

#     try:
#         content_item['custom_param_data']['story-summary'] = markdown.markdown(htmlstory['story_summary'])
#     except KeyError:
#         raise MissingP2PContentItemFieldError('story_summary')

#     try:
#         context = site.get_context()
#         base_url = "http://{0}/".format(context['ROOT_URL'])
#         content_item['original_thumbnail_url'] = base_url + htmlstory['thumbnail']
#         content_item['thumbnail_source_code'] = 'chicagotribune'
#     except KeyError:
#         # `thumbnail` value not found in data from spreadsheet
#         raise MissingP2PContentItemFieldError('thumbnail')

#     try:
#         p2p_conn = p2p.get_connection()

#         created, response = p2p_conn.create_or_update_content_item(content_item)
#         if created:
#             # If we just created the item, set its state to 'working'
#             p2p_conn.update_content_item({
#                 'slug': htmlstory['p2p_slug'],
#                 'content_item_state_code': 'working',
#                 'kicker_id': P2P_DATA_KICKER_ID,
#             })

#     except JSONDecodeError:
#         # HACK: Something is borked with either python-p2p or the P2P content services
#         # API itself. It's ok to ignore this error
#         puts("\n" + colored.yellow(
#              "JSONDecodeError! when publishing to P2P. This is probably OK"))

#     puts("\n" + colored.green(
#         "Published to HTML story to P2P with slug {}".format(htmlstory['p2p_slug'])))

# # from blueprint import get_deprecated_htmlstory_config
# def get_deprecated_htmlstory_config(context):
#     """
#     Get the P2P properties from the values worksheet.

#     This makes the blueprint backward compatible with how we used to get
#     the P2P content item properties from the `values` worksheet of the
#     Tarbell spreadsheet.

#     We now read this from rows of the `p2p_content_items` worksheet of the
#     Tarbell spreadsheet in order to support publishing multiple content
#     items from one Tarbell project.


#     Args:
#         context (dict): Tarbell site context.

#     Returns:
#         Dictionary that can be passed to `p2p_publish_htmlstory`
#         to construct a request to the P2P API
#         to create or update an HTML story content item.

#     Raises:
#         KeyError if the keys aren't defined.

#     """

#     htmlstory = {}

#     required_fieldnames = (
#             ('p2p_slug', 'p2p_slug'),
#     )

#     optional_fieldnames = (
#             ('headline', 'title'),
#             ('seotitle', 'seotitle'),
#             ('seodescription', 'seodescription'),
#             ('keywords', 'keywords'),
#             ('byline', 'byline'),
#             ('story_summary', 'story_summary'),
#     )

#     for spreadsheet_field_name, output_field_name in required_fieldnames:
#         htmlstory[output_field_name] = context[spreadsheet_field_name]

#     for spreadsheet_field_name, output_field_name in optional_fieldnames:
#         htmlstory[output_field_name] = context.get(spreadsheet_field_name, '')

#     return htmlstory

# # from blueprint import render_p2p_content_item
# def render_p2p_content_item(content_item, site):
#     """
#     Render a P2P content item using Flask

#     Args:
#         content_item (dict): P2P content item metadata from your project's
#             p2p_content_items worksheet.
#         site (TarbellSite): Tarbell site instance.

#     Returns:
#         String containing rendered HTML.

#     """
#     # Use the technique from Frozen-Flask to use our local preview views
#     # to render our templates
#     # See
#     # https://github.com/Frozen-Flask/Frozen-Flask/blob/master/flask_frozen/__init__.py#L267

#     # First, get the URL path for the content item based on the slug
#     content_type = content_item['content_type']
#     if content_type == 'htmlstory':
#         # We use the `raw` view because we don't want to mock
#         # page chrome
#         path = '/htmlstories/{p2p_slug}/raw'.format(
#             p2p_slug=content_item['p2p_slug'])
#     elif content_type == 'blurb':
#         path = '/blurbs/{p2p_slug}'.format(
#             p2p_slug=content_item['p2p_slug'])
#     else:
#         raise ValueError("Unknown P2P content type '{0}'".format(
#             content_type))


#     # Now request our view using the text client
#     client = site.app.test_client()
#     base_url = site.app.config['FREEZER_BASE_URL']
#     response = client.get(path, base_url=base_url)

#     if response.status_code != 200:
#         raise ValueError("Unexpected status {0} on path {1}".format(
#             response.status_code, path))

#     rendered = response.data

#     if u'“' in rendered or u'”' in rendered:
#             # HACK: Work around P2P API's weird handling of curly quotes where it
#             # converts the first set to HTML entities and converts the rest to
#             # upside down quotes
#             msg = ("Removing curly quotes because it appears that the P2P API does "
#                    "not handle them correctly.")
#             puts("\n" + colored.red(msg))
#             rendered = ftfy.fix_text(rendered, uncurl_quotes=True)

#     return rendered

# # from blueprint import is_production_bucket
# def is_production_bucket(bucket_url, buckets):
#     """
#     Returns True if bucket_url represents the production bucket

#     Args:
#         bucket_url (str): URL to S3 bucket
#         buckets (list): List of bucket configurations, from the Tarbell site's
#             config

#     Returns:
#         True if bucket_url represents the production bucket.

#     """
#     for name, url in buckets.items():
#         if url == bucket_url and name == 'production':
#             return True

#     return False


"""
Tarbell project configuration
"""

blueprint = Blueprint('property-taxes-cook-county', __name__)
CONTENT_ITEMS_WORKSHEET = 'p2p_content_items'

# Google document key for the stories
DOC_KEY = '1HlDz84N-29l7lUqatSAQIcWOjOwCOs6jyKYrEQnze-4'

def get_drive_api_stuff():
    service = get_drive_api()
    try:
        docfile = service.files().get(fileId=DOC_KEY).execute()
        downloadurl = docfile['exportLinks']['text/html'] # export as 'text/html' instead of 'text/plain' if we want to parse links and styles
        resp, content = service._http.request(downloadurl)

        # write to file
        with open('out_drive.html', 'w+') as f:
            text = content.decode("utf-8-sig", errors='ignore') # get rid of BOM
            f.write(text.encode('utf8', 'replace')) # lol
        return text
    except errors.HttpError, error:
        print 'An error occurred: %s' % error

get_drive_api_stuff()

def get_extra_context():
  call(["node", "node_scripts/js_parser.js", "out_drive.html"]) # parse the html before loading it into archieML
  with open('out_parsed.txt') as f:
    data = archieml.load(f)
  data = dict(data)
  return data

@blueprint.app_template_filter()
def add_ptags(text):
    p_text = '<p>'+text; # opening p
    p_text = p_text.replace('\n', '</p><p>') + '</p>' # closing p
    return Markup(p_text)

@blueprint.app_template_filter()
def format(title):
  return title.replace('-', ' ').capitalize()

@blueprint.app_template_filter()
def lower(filename):
  return filename.lower()

############################
# copied from blueprint.py #
############################

def _get_published_content(site, s3, **extra_context):
    template = site.app.jinja_env.get_template('_content.html')
    context = site.get_context(publish=True)
    context.update(extra_context)
    rendered = template.render(**context)

    return rendered

def p2p_publish_archiemlstory(site, s3):
    if not is_production_bucket(s3.bucket, site.project.S3_BUCKETS):
        puts(colored.red(
            "\nNot publishing to production bucket. Skipping P2P publiction."))
        return

    context = site.get_context(publish=True)

    # Handle old-style configuration for publishing HTML story from values
    # worksheet. This is deprecated, but still support it in case someone
    # accidentally upgrades their blueprint in an old project
    try:
        content_item = get_deprecated_htmlstory_config(context)
        msg = ("\nYou've configured your HTML story in the 'values' worksheet. "
                "Don't do this. It will work for now, but may stop working "
                "soon. Instead, configure it in the 'p2p_content_items' "
                "worksheet.")
        puts(colored.red(msg))
        p2p_publish_htmlstory(content_item, site, s3)

    except KeyError:
        # This is fine. Actually preferred. There shouldn't be anything
        # P2P-related
        pass

    try:
        content_items = context[CONTENT_ITEMS_WORKSHEET]
    except KeyError:
        # No worksheet with the P2P content item configuration.  Fail!
        msg = ("\nYou need a worksheet named {0} in your Tarbell spreadsheet "
               "to publish P2P content items").format(CONTENT_ITEMS_WORKSHEET)
        puts(colored.red(msg))
        return

    for i, content_item in enumerate(content_items):
        try:
            content_type = content_item['content_type']
        except KeyError:
            msg = ("\nYou need to specify a content type for P2P content "
                    "item {0}").format(i)
            continue

        try:
            if content_type == 'blurb':
                p2p_publish_blurb(content_item, site, s3)

            elif content_type == 'htmlstory':
                p2p_publish_htmlstory(content_item, site, s3)

            else:
                msg = ("\nUnknown content type '{0}' for P2P content "
                       "item {1}. Skipping publication.").format(content_type, i)
                puts(colored.yellow(msg))
                continue

        except MissingP2PContentItemFieldError as e:
            # The spreadsheet is missing a field needed to publish. Fail
            # gracefully.
            msg = ("\nYou need to specify field '{0}' for P2P content "
                    "item {1}. Skipping publication.").format(e.field_name, i)
            puts(colored.yellow(msg))
            continue

        except TemplateNotFound:
            msg = ("\nCould not find template '{0}' for P2P content "
                   "item {1}. Skipping publication").format(
                       content_item['template'], i)
            puts(colored.yellow(msg))
            continue



@blueprint.app_template_filter('xldate_to_datetime')
def xldate_to_datetime(xldate):
    return xldate
    if isinstance(xldate, unicode):
        print('unicode!!')
        retval = datetime.datetime.strptime(xldate, '%m/%d/%Y')
    else:
        print('Not unicode!!')
        retval = xlrd.xldate.xldate_as_datetime(xldate, 0)
        # retval = xldate_as_tuple(xldate, 0)
    return retval

@blueprint.app_template_filter('format_date')
def format_vote_date(date_to_format, format):
    return date_to_format.strftime(format)

@blueprint.app_template_filter('get_video_ref')
def get_video_ref(url):
    """
    plucks a needed reference # from the video url
    """
    retval = url.split("/")
    ref_index = retval.index("videogallery") + 1
    return retval[ref_index]

@blueprint.app_template_filter('generate_id')
def generate_id(number):
    rando = random.random()
    return "myExperience {}".format(rando)

@blueprint.app_template_filter('check_for_methods')
def check_for_methods(methods, part):
    """
        This filter returns true if the specififed story (part) has ANY methodologies in the spreadsheet. 
        If there are none, it returns false.
    """
    for method in methods:
        if method['part'] == part:
            return True
    return False

@blueprint.app_template_filter('get_up_next')
def get_up_next(parts, current_part):
    """
        Takes the entire dict of story parts (day1, day2, etc.) and the current story part (part1, part2 , etc).
        It finds the next story and stashes it inside the retval with it's own key. the rest of the parts
        are put into retval['rest'] 
        
    """
    retval = {}
    for i in range(0, len(parts)):
        if parts[i]['part'] == current_part:
            try: 
                retval['next'] = parts[i+1]
                del parts[i+1]
                retval['rest'] = parts
                break
            except IndexError:
                # This exception exists incase there is no up next, in which case there would be an index error
                retval['next'] = False
                retval['rest'] = parts
    return retval


@blueprint.app_template_filter('check_if_is_okay_to_publish')
# @jinja2.contextfilter
def check_if_is_okay_to_publish(photo):
    """
    Takes a p2p data dict and determines if it is okay to publish this content item. It will return true
    in all cases except when the content is not set to Live and the publish url is the production bucket
    """
    return True



# Google spreadsheet key
SPREADSHEET_KEY = "1CDBifEOKDp5wc-uZjRDJlYTuiSvNE2pdbDNd2OPusyY"

# Exclude these files from publication
EXCLUDES = ['_subtemplates', 'node_scripts', '_storage','storage', '*.md', 'requirements.txt', 'node_modules', 'sass', 'js/src', 'package.json', 'Gruntfile.js']

# Spreadsheet cache lifetime in seconds. (Default: 4)
# SPREADSHEET_CACHE_TTL = 4

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# Get context from a local file or URL. This file can be a CSV or Excel
# spreadsheet file. Relative, absolute, and remote (http/https) paths can be 
# used.
# CONTEXT_SOURCE_FILE = ""

# EXPERIMENTAL: Path to a credentials file to authenticate with Google Drive.
# This is useful for for automated deployment. This option may be replaced by
# command line flag or environment variable. Take care not to commit or publish
# your credentials file.
# CREDENTIALS_PATH = ""

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    
    "production": "apps.chicagotribune.com/news/watchdog/cook-county-property-tax",
    "staging": "apps.beta.tribapps.com/property-taxes-cook-county",
}

# Default template variables
DEFAULT_CONTEXT = {
   'OMNITURE': {   'domain': 'chicagotribune.com',
                    'section': 'news',
                    'sitename': 'Chicago Tribune',
                    'subsection': 'watchdog',
                    'subsubsection': '',
                    'type': 'dataproject'},
    'name': 'property-taxes-cook-county',
    'title': 'This is the title'
}

# HOOKS = (
#     get_drive_api_stuff,
# )

# for f in HOOKS:
#     register_hook('preview')(f)


# def get_drive_api_stuff():
#     service = get_drive_api()
#     try:
#         docfile = service.files().get(fileId=DOC_KEY).execute()
#         downloadurl = docfile['exportLinks']['text/html'] # export as 'text/html' instead of 'text/plain' if we want to parse links and styles
#         resp, content = service._http.request(downloadurl)

#         # write to file
#         with open('out_drive.html', 'w+') as f:
#             text = content.decode("utf-8-sig", errors='ignore') # get rid of BOM
#             f.write(text.encode('utf8', 'replace')) # lol
#         return text
#     except errors.HttpError, error:
#         print 'An error occurred: %s' % error

DEFAULT_CONTEXT.update(**get_extra_context())